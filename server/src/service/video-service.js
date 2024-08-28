const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');

const fs = require('fs');
const path = require('path');
const util = require('util');
const ffprobe = util.promisify(require('fluent-ffmpeg').ffprobe);

const { UserSchema, VideoSchema } = require('../database/model');

const ApiError = require('../exceptions/api-error');

const UserDto = require('../dto/user-dto');
const VideoDto = require('../dto/video-dto');
const CommentDto = require('../dto/comment-dto');
const { videoExtensions } = require('../config/extensions');
const { commentFilterTypes } = require('../config/settings');
const notificationService = require('./notification-service');

ffmpeg.setFfprobePath(require("@ffprobe-installer/ffprobe").path)
ffmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path)

class VideoService {
    async uploadVideo(userId, video, name, commentsAllowed, visibility, scheduleDate) {
        const uuid = video.filename.split(".")[0];
        const metadata = await ffprobe(video.path)
        const durationInSeconds = metadata.format.duration;
        const maxDuration = 60 * 60; // 1 hour
        if (durationInSeconds > maxDuration) throw ApiError.BadRequest("Video duration exceeds the maximum allowed duration of 1 hour.");

        const fileSizeInBytes = fs.statSync(video.path).size;
        const fileSizeInGB = Math.floor(fileSizeInBytes / (1024 * 1024 * 1024));

        if (fileSizeInGB > 10) throw ApiError.BadRequest("Video file size exceeds the maximum allowed size of 10GB.");

        const { width, height } = metadata.streams[0];

        if (width < 576 || height < 576) throw ApiError.BadRequest("Video resolution must be at least 576x576");

        const thumbnailPath = "uploads/profile/thumbnails/" + uuid + ".png"; 

        await generateThumbnail(video.path, thumbnailPath, width, height);

        if (new Date(scheduleDate) < new Date()) throw ApiError.BadRequest("Schedule date cannot be in the past.");
        if (Math.floor((new Date(scheduleDate) - new Date()) / 1000) > 30 * 24 * 60 * 60 ) throw ApiError.BadRequest("Schedule date cannot be more than 30 days in the future.");

        var video = {
            videoId: uuid,
            authorId: userId,
            name: name || "No title",
            commentsAllowed,
            duration: durationInSeconds,
            views: [{
                userId
            }],
        }

        if (scheduleDate){
            video.schedule = {
                date: scheduleDate,
                isSchedule: true,
                visibility: visibility,
            }
            video.visibility = "private";
        } else {
            video.visibility = visibility;
        }

        await VideoSchema.create(video)

        return uuid;
    }

    async getVideoData(user, videoId){
        const video = await VideoSchema.findOne({ videoId }).exec();
        if (!video) {
            throw ApiError.BadRequest("Video not found.");
        }

        const videoData = new VideoDto(video);

        if (user){
            videoData.hasLike = video.likes.some(like => like.userId.toString() === user.userId)

            const lastUserView = video.views.length > 0 && video.views.filter(view => view.userId.toString() === user.userId);
            const newestView = lastUserView.length > 0 ? lastUserView[lastUserView.length - 1] : undefined;

            if (!newestView || Math.floor((new Date() - new Date(newestView.time) ) / 1000 > 60 * 30 )){
                video.views.push({
                    userId: user.userId
                })
                videoData.views++;

                await video.save();
            }
        }

        const author = await UserSchema.findOne({userId: video.authorId}).lean().exec()
        if (!author) throw ApiError.ServerError("Author not found.");
        videoData.author = new UserDto(author);

        return videoData;
    }

    async getVideo(videoId){
        const video = await VideoSchema.findOne({ videoId }).exec();
        
        if (!video) {
            throw ApiError.BadRequest("Video not found.");
        }

        const directory = path.join('uploads/profile/videos');
        const filePath = findVideoFile(directory, videoId);
        if (!filePath) {
            throw ApiError.BadRequest("Video file not found.");
        }
        
        const absolutePath = path.resolve(filePath);

        return absolutePath;
    }

    async likeVideo(videoId, userId, username){
        const video = await VideoSchema.findOne({ videoId }).exec();
        const user = await UserSchema.findOne({ username }).exec();
        if (!video) {
            throw ApiError.BadRequest("Video not found.");
        }

        const userHasLiked = video.likes.some(like => like.userId === userId)

        if (userHasLiked) {
            video.likes = video.likes.filter(like => like.userId !== userId);
            user.likedVideos = user.likedVideos.filter(like => like.videoId !== videoId);
        } else {
            await notificationService.createNotification({
                type: "like",
                userId: video.authorId,
                content: `${username} liked your video`,
                senderId: userId,
                videoId,
            });
            video.likes.push({ userId });
            user.likedVideos.push({ videoId })
        }

        await video.save();
        await user.save();

        return [video.likes.length, userHasLiked, user.likedVideos];
    }

    async likeComment(videoId, commentId, username, userId){
        const video = await VideoSchema.findOne({ videoId }).exec();
        if (!video) {
            throw ApiError.BadRequest("Video not found.");
        }

        const comment = video.comments.find(comment => comment.commentId === commentId);
        if (!comment) throw ApiError.BadRequest("Comment not found.");

        const hasLiked = comment.likes.some(like => like.userId === userId);
        
        if (comment.likes.length > 0 && hasLiked) {
            comment.likes = comment.likes.filter(like => like.userId !== userId)
        } else {
            comment.likes.push({ userId });

            await notificationService.createNotification({
                type: "like",
                userId: comment.authorId,
                content: `${username} liked your comment`,
                senderId: userId,
                videoId,
                commentId
            });
        }

        await video.save();

        return [hasLiked, comment.likes.length];
    }

    async commentVideo(videoId, userId, content, isReply, replyId){
        const video = await VideoSchema.findOne({ videoId }).exec();
        if (!video) throw ApiError.BadRequest("Video not found.");

        if (!video.commentsAllowed) throw ApiError.BadRequest("Comments are not allowed for this video.");
        if (isReply && !replyId) throw ApiError.BadRequest("Reply ID is required.");
        if (isReply && replyId && !video.comments.find(comment => comment.commentId === replyId)) throw ApiError.BadRequest("Reply comment not found.");

        const author = await UserSchema.findOne({ userId });

        if (isReply && replyId){
            await notificationService.createNotification({
                type: "reply",
                userId: video.comments.find(comment => comment.commentId === replyId).authorId,
                content: `${author.username} replied on your comment`,
                senderId: userId,
                videoId,
                commentId: replyId
            });
        }

        video.comments.push({
            authorId: userId,
            authorUsername: author.username,
            commentId: uuidv4(),
            content,
            reply: {
                isReply,
                commentId: replyId || null,
            },
            time: new Date()
        })
        
        await video.save();
        const comment = video.comments[video.comments.length - 1];

        const mentions = getMentions(content);
        if (mentions.length > 0){
            for (const mention of mentions){
                const user = await UserSchema.findOne({ username: mention }).exec();
                if (user) {
                    await notificationService.createNotification({
                        type: "mention",
                        userId: user.userId,
                        content: `${author.username} mentioned you in a comment`,
                        senderId: userId,
                        videoId,
                        commentId: comment.commentId
                    });
                }
            }
        }

        return comment;
    }

    async repostVideo(videoId, userId, isProfileRepost){
        const video = await VideoSchema.findOne({ videoId }).exec();
        if (!video) throw ApiError.BadRequest("Video not found.");

        const hasRepost = video.reposts.filter(repost => repost.userId === userId)

        if (isProfileRepost) {
            const user = await UserSchema.findOne({ userId }).exec();
            if (!user) throw ApiError.BadRequest("User not found");

            const hasProfileRepost = user.repostedVideos.length > 0 ? user.repostedVideos.filter(repost => repost.videoId === videoId) : [];
            if (hasProfileRepost.length > 0) throw ApiError.BadRequest("You have already reposted this video to your profile");

            user.repostedVideos.push({ videoId });
            video.reposts.push({ userId });

            await user.save();
            await video.save();
        } else {
            if (hasRepost.length > 0) throw ApiError.BadRequest("You have already reposted this video.");

            video.reposts.push({ userId });
            await video.save();
        }

        return video.reposts.length;
    }

    async favoriteVideo(videoId, userId){
        const video = await VideoSchema.findOne({ videoId }).exec();
        if (!video) throw ApiError.BadRequest("Video not found.");

        const user = await UserSchema.findOne({ userId }).exec();
        if (!user) throw ApiError.BadRequest("User not found");

        const hasFavorited = video.favorites.filter(favorite => favorite.userId === userId) || user.favorites.filter(favorite => favorite.userId === userId);
        if (hasFavorited.length > 0) {
            video.favorites = video.favorites.filter(favorite => favorite.userId !== userId);
            user.favorites = user.favorites.filter(favorite => favorite.videoId !== videoId);
        } else {
            video.favorites.push({ userId });
            user.favorites.push({ videoId });
        }

        await user.save();
        await video.save();

        return [video.favorites.length, hasFavorited.length > 0];
    }

    async getComments({ videoId, lastMessageId, filterType, sortType, messageId, requser }){
        const video = await VideoSchema.findOne({ videoId }).exec();
        if (!video) throw ApiError.BadRequest("Video not found.");

        let comments;

        if (!messageId){
            if (filterType && !commentFilterTypes.includes(filterType)) throw ApiError.BadRequest("Invalid comment filter type.");
            if (sortType && sortType !== "increase" && sortType !== "decrease") throw ApiError.BadRequest("Invalid comment sort type.");
    
            comments = video.comments.filter(comment => !comment.reply.isReply)
    
            comments.sort((a, b) => {
                let compareValue;
                if (filterType === "likes") {
                    compareValue = a.likes.length - b.likes.length;
                } else if (filterType === "replies") {
                    compareValue = video.comments.filter(reply => reply.reply.commentId === a.commentId).length - 
                                   video.comments.filter(reply => reply.reply.commentId === b.commentId).length;
                } else {
                    compareValue = new Date(a.time) - new Date(b.time);
                }
                
                return sortType === "increase" ? compareValue : -compareValue;
            });
        } else {
            comments = video.comments.filter(comment => comment.reply.commentId === messageId);
            if (!comments) throw ApiError.BadRequest("Comments not found.");
        }


        if (lastMessageId) {
            const lastMessageIndex = comments.findIndex(comment => comment.commentId === lastMessageId);
            if (lastMessageIndex !== -1) {
                comments = comments.slice(lastMessageIndex + 1);
            }
        }

        const replies = video.comments.filter(comment => comment.reply.isReply && comment.reply.commentId);

        const replyCountMap = replies.reduce((acc, comment) => {
            const parentId = comment.reply.commentId;
            if (acc[parentId]) {
                acc[parentId]++;
            } else {
                acc[parentId] = 1;
            }
            return acc;
        }, {});

        const commentsData = comments.slice(0, 15).map(comment => {
            const replyCount = replyCountMap[comment.commentId] || 0;
            const likesData = requser ? comment.likes : comment.likes.length;
            return {
                ...new CommentDto(comment),
                replyCount: replyCount,
                likes: likesData
            };
        });

        return commentsData
    }

    async getThumbnail(videoId){
        const video = await VideoSchema.findOne({ videoId }).exec();
        if (!video) throw ApiError.BadRequest("Video not found.");

        const filePath = path.join("uploads/profile/thumbnails", `${videoId}.png`);
        if (!filePath) throw ApiError.BadRequest("Video picture not found");

        const absolutePath = path.resolve(filePath);

        return absolutePath
    }

    async getLikedComments(videoId, userId) {
        const video = await VideoSchema.findOne({ videoId }).exec();
        if (!video) throw ApiError.BadRequest("Video not found.");

        const filteredComments = video.comments.filter(comment => 
            comment.likes.some(like => like.userId === userId)
        );

        const likedComments = filteredComments.map(comment => comment.commentId);

        return likedComments;
    }

    async getUserVideo(username, videoIndex, user, filter) {
        const author = await UserSchema.findOne({ username }).lean().exec();
        if (!author) throw ApiError.BadRequest("Author not found");

        let totalVideos;
        let query = {};
        let validVideoIds = [];
        if (filter === "null") {
            // No filter: count all videos directly
            totalVideos = await VideoSchema.countDocuments({ authorId: author.userId, visibility: "everyone" });
            query = { authorId: author.userId, visibility: "everyone" };
        } else if (filter === "likes") {
            // Filter by liked videos: filter out deleted videos
            validVideoIds = (await Promise.all(
                author.likedVideos.map(async video => {
                    const exists = await VideoSchema.exists({ videoId: video.videoId, visibility: "everyone" });
                    return exists ? video.videoId : null;
                })
            )).filter(Boolean);
            totalVideos = validVideoIds.length;
        } else if (filter === "reposts") {
            // Filter by reposted videos: filter out deleted videos
            validVideoIds = (await Promise.all(
                author.repostedVideos.map(async video => {
                    const exists = await VideoSchema.exists({ videoId: video.videoId, visibility: "everyone" });
                    return exists ? video.videoId : null;
                })
            )).filter(Boolean);
            totalVideos = validVideoIds.length;
        } else if (filter === "favorites") {
            // Filter by favorite videos: filter out deleted videos
            validVideoIds = (await Promise.all(
                author.favorites.map(async video => {
                    const exists = await VideoSchema.exists({ videoId: video.videoId, visibility: "everyone" });
                    return exists ? video.videoId : null;
                })
            )).filter(Boolean);
            totalVideos = validVideoIds.length;
        } else {
            throw ApiError.BadRequest("Invalid filter");
        }

        if (totalVideos < 1) {
            throw ApiError.BadRequest("No videos available");
        }

        if (videoIndex > totalVideos || videoIndex < 1) {
            throw ApiError.BadRequest("Invalid video index");
        }

        let video = null;
        let indexOffset = 0;

        while (!video && indexOffset < totalVideos) {
            if (filter === "null") {
                video = await VideoSchema.findOne(query)
                    .sort({ isPinned: -1, _id: 1 })
                    .skip(videoIndex - 1 + indexOffset)
                    .exec();
            } else {
                const currentVideoId = validVideoIds[videoIndex - 1 + indexOffset];
                video = await VideoSchema.findOne({ videoId: currentVideoId, visibility: "everyone" }).exec();
            }

            if (!video) indexOffset++;
        }

        if (!video) throw ApiError.BadRequest("Video not found");

        const videoData = new VideoDto(video);

        if (user) {
            videoData.hasLike = video.likes.some(like => like.userId.toString() === user.userId);

            const lastUserView = video.views.length > 0 && video.views.filter(view => view.userId.toString() === user.userId);
            const newestView = lastUserView.length > 0 ? lastUserView[lastUserView.length - 1] : undefined;

            if (!newestView || Math.floor((new Date() - new Date(newestView.time)) / 1000 > 60 * 30)) {
                video.views.push({
                    userId: user.userId
                });
                videoData.views++;

                await video.save();
            }
        }

        videoData.author = new UserDto(author);

        return [videoData, totalVideos];
    }

    async getUserProfileVideos(username, tab, user) {
        const author = await UserSchema.findOne({ username }).lean().exec();
        if (!author) throw ApiError.BadRequest("Author not found");

        let videos = [];
        const selfProfile = user ? user.userId === author.userId : false;
        const isFriends = user ? author.follows.some(follow => follow.userId === user.userId) && author.followers.some(follower => follower.userId === user.userId) : false;

        if (tab === "videos") {
            const visibility = selfProfile ? ["private", "friends", "everyone"] : isFriends ? ["friends", "everyone"] : ["everyone"];
            videos = await VideoSchema.find({ authorId: author.userId, visibility: { $in: visibility } }).lean().exec();
        } else if (tab === "favorites") {
            if (selfProfile) {
                videos = await Promise.all(author.favorites.map(async v => {
                    let tempVideo = await VideoSchema.findOne({ videoId: v.videoId }).lean().exec();
                    if (tempVideo) return tempVideo;
                })).then(results => results.filter(result => result !== undefined))
            } else {
                throw ApiError.BadRequest("You have no access to this tab");
            }
        } else if (tab === "likes") {
            if (!author.private.isLikedVideosPrivate || selfProfile) {
                videos = await Promise.all(author.likedVideos.map(async v => {
                    let tempVideo = await VideoSchema.findOne({ videoId: v.videoId }).lean().exec();
                    if (tempVideo) return tempVideo;
                })).then(results => results.filter(result => result !== undefined))
            } else {
                throw ApiError.BadRequest("Liked videos are private");
            }
        } else if (tab === "reposts") {
            if (!author.private.isRepostedVideosPrivate || selfProfile) {
                videos = await Promise.all(author.repostedVideos.map(async v => {
                    let tempVideo = await VideoSchema.findOne({ videoId: v.videoId }).lean().exec();
                    if (tempVideo) return tempVideo;
                })).then(results => results.filter(result => result !== undefined))
            } else {
                throw ApiError.BadRequest("Reposted videos are private");
            }
        }

        const videosData = videos.map(video => new VideoDto(video));
        return [videosData, videosData.length];
    }

    async deleteVideo(videoId, userId) {
        const video = await VideoSchema.findOne({ videoId }).exec();
        if (!video) throw ApiError.BadRequest("Video not found.");

        if (video.authorId !== userId) throw ApiError.BadRequest("You cannot delete this video.");

        const directory = path.join('uploads/profile/videos');
        const filePath = findVideoFile(directory, videoId);
        if (filePath) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await video.deleteOne();
    }
}

function generateThumbnail(videoPath, thumbnailPath, width, height, timestamp = '00:00:01') {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .screenshots({
                timestamps: [timestamp],
                filename: path.basename(thumbnailPath),
                folder: path.dirname(thumbnailPath),
                size: `${width}x${height}`,
            })
            .on('end', () => {
                console.log('Thumbnail generated successfully');
                resolve();
            })
            .on('error', (err) => {
                console.error('Error generating thumbnail:', err);
                reject(err);
            });
    });
}

const getMentions = (text) => {
    const mentionPattern = /@(\w+)/g;
    let mentions = [];
    let match;
    
    while ((match = mentionPattern.exec(text)) !== null) {
        mentions.push(match[1]);
    }
    
    return mentions;
}

const findVideoFile = (directory, videoId) => {
    for (const extension of videoExtensions) {
        const filePath = path.join(directory, `${videoId}${extension}`);
        if (fs.existsSync(filePath)) {
            return filePath;
        }
    }
    return null;
};

module.exports = new VideoService();