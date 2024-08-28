const fs = require('fs');
const ApiError = require("../exceptions/api-error");
const tokenService = require("../service/token-service");
const videoService = require("../service/video-service");
const { VideoSchema } = require('../database/model');

class VideoController {
    async getVideo(req, res, next) {
        try{
            const authorizationHeader = req.headers.authorization;
            if (authorizationHeader){
                const token = authorizationHeader.split(" ")[1];
                if (token){
                    const userData = tokenService.validateAccessToken(token);
                    if (userData){
                        req.user = userData;
                    }
                }
            }

            const absolutePath = await videoService.getVideo(req.params.videoId, req.user);
            
            res.sendFile(absolutePath);
        } catch(e){
            next(e);
        }
    }

    async getVideoData(req, res, next) {
        try{
            const authorizationHeader = req.headers.authorization;
            if (authorizationHeader){
                const token = authorizationHeader.split(" ")[1];
                if (token){
                    const userData = tokenService.validateAccessToken(token);
                    if (userData){
                        req.user = userData;
                    }
                }
            }

            const videoData = await videoService.getVideoData(req.user, req.params.videoId);

            res.status(200).json(videoData)
        } catch(e){
            next(e);
        }
    }

    async uploadVideo(req, res, next) {
        try{
            const { name, commentsAllowed, visibility, scheduleDate } = req.body;
            if (!name || !visibility) next(ApiError.BadRequest("Missing required fields."));
            if (!req.file) next(ApiError.BadRequest("No video file uploaded."));

            const uuid = await videoService.uploadVideo(req.user.userId, req.file, name, commentsAllowed, visibility, scheduleDate);

            res.status(200).json({ message: "Video uploaded successfully.", videoId: uuid });
        } catch(e){
            if (req.file && req.file.path){
                fs.unlinkSync(req.file.path);
            }
            next(e);
        }
    }

    async likeVideo(req, res, next) {
        try{
            const { videoId } = req.params;
            
            const [ likes, userHasLiked, userLikedVideos ] = await videoService.likeVideo(videoId, req.user.userId, req.user.username);
            res.status(200).json({ message: `Video ${userHasLiked ? "unliked" : "liked"} successfully.`, likes: likes, userHasLiked, userLikedVideos });
        } catch(e){
            next(e);
        }
    }

    async likeComment(req, res, next){
        try{
            const { videoId, commentId } = req.params;
            const [userHasLiked, likes] = await videoService.likeComment(videoId, commentId, req.user.username, req.user.userId);

            res.status(200).json({ message: `Comment ${userHasLiked? "unliked" : "liked"} successfully.`, userHasLiked, likes});
        } catch(e){
            next(e);
        }
    }

    async commentVideo(req, res, next) {
        try{
            const { videoId } = req.params;
            const { content, isReply, commentId } = req.body
            if (!content) return next(ApiError.BadRequest("Missing required fields."));
            const comment = await videoService.commentVideo(videoId, req.user.userId, content, isReply, commentId);

            res.status(200).json({ message: "Comment added successfully.", comment });
        } catch(e){
            next(e);
        }
    }

    async repostVideo(req, res, next) {
        try{
            const reposts = await videoService.repostVideo(req.params.videoId, req.user.userId, req.body.isProfileRepost);

            res.status(200).json({ reposts });
        } catch(e){
            next(e);
        }
    }

    async favoriteVideo(req, res, next) {
        try{
            const { videoId } = req.params;
            const [favorites, hasAlreadyFavorited] = await videoService.favoriteVideo(videoId, req.user.userId);

            res.status(200).json({ message: `Video ${hasAlreadyFavorited ? "unfavorited" : "favorited"} successfully.`, favorites, hasAlreadyFavorited });
        } catch(e){
            next(e);
        }
    }

    async deleteVideo(req, res, next) {
        try{
            const { videoId } = req.params;

            await videoService.deleteVideo(videoId, req.user.userId);
            res.status(200).json({ message: "Video deleted successfully." });;
        } catch(e){
            next(e);
        }
    }

    async getThumbnail(req, res, next){
        try{
            const { videoId } = req.params;

            const thumbnailPath = await videoService.getThumbnail(videoId);
            
            res.sendFile(thumbnailPath);
        } catch(e){
            next(e);
        }
    }

    async getLikedComments(req, res, next) {
        try {
            const { videoId } = req.params;

            const comments = await videoService.getLikedComments(videoId, req.user.userId);

            res.status(200).json(comments);
        } catch(e) {
            next(e);
        }
    }

    async getRandomVideo(req, res, next) {
        try {
            const authorizationHeader = req.headers.authorization;
            if (authorizationHeader){
                const token = authorizationHeader.split(" ")[1];
                if (token){
                    const userData = tokenService.validateAccessToken(token);
                    if (userData){
                        req.user = userData;
                    }
                }
            }

            const pipeline = [
                ...(req.body.currentVideoId ? [{ $match: { videoId: { $ne: req.body.currentVideoId } } }] : []),
                { $sample: { size: 1 } }
            ];
          
            const randomVideo = await VideoSchema.aggregate(pipeline);

            const videoData = await videoService.getVideoData(req.user, randomVideo[0].videoId);
            
            res.status(200).json(videoData)
        } catch(e) {
            next(e);
        }
    }

    async getUserVideo(req, res, next) {
        try {
            const authorizationHeader = req.headers.authorization;
            if (authorizationHeader){
                const token = authorizationHeader.split(" ")[1];
                if (token){
                    const userData = tokenService.validateAccessToken(token);
                    if (userData){
                        req.user = userData;
                    }
                }
            }

            const { username } = req.params;
            const { videoIndex, tab, filter } = req.query;
            if (videoIndex || tab) {
                const [result, totalVideos] = videoIndex
                    ? await videoService.getUserVideo(username, videoIndex, req.user, filter)
                    : await videoService.getUserProfileVideos(username, tab, req.user);
    
                if (result) {
                    res.json({ video: result, totalVideos });
                } else {
                    res.status(404).json({ message: "Couldn't find any videos" });
                }
            } else {
                res.status(400).json({ message: "Missing required fields." });
            }
        } catch(e) {
            next(e);
        }
    }

    async getComments(req, res, next) {
        try{
            const authorizationHeader = req.headers.authorization;
            if (authorizationHeader){
                const token = authorizationHeader.split(" ")[1];
                if (token){
                    const userData = tokenService.validateAccessToken(token);
                    if (userData){
                        req.user = userData;
                    }
                }
            }

            const { videoId } = req.params;

            const comments = await videoService.getComments({
                videoId, 
                lastMessageId: req.body.lastMessageId, 
                filterType: req.body.filterType,
                sortType: req.body.sortType,
                messageId: req.body.messageId,
                requser: req.user
            });

            res.status(200).json(comments)
        } catch(e) {
            next(e);
        }
    }
}

module.exports = new VideoController();