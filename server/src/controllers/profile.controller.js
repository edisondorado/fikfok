const fs = require("fs");

const ApiError = require("../exceptions/api-error");
const UserDto = require("../dto/user-dto");
const profileService = require("../service/profile-service");
const tokenService = require("../service/token-service");
const { NotificationSchema, UserSchema, VideoSchema } = require("../database/model");

class ProfileController {
    async getProfile(req, res, next) {
        try{
            const { username } = req.params;

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

            const userData = await profileService.getProfile(username, req.user);
            res.status(200).json(userData);
        } catch(e){
            next(e);
        }
    }
    
    async getNotifications(req, res, next) {
        try{
            let notifications = await NotificationSchema.find({userId: req.user.userId}).exec();

            if (notifications.length > 0){
                let newNotifications = await Promise.all(notifications
                    .filter(notify => Math.floor((new Date() - new Date(notify.time))/1000) < 60 * 60 * 24 )
                    .map(transformNotification));
                let oldNotifications = await Promise.all(
                    notifications
                        .reverse()
                        .filter(notify => Math.floor((new Date() - new Date(notify.time)) / 1000) >= 60 * 60 * 24)
                        .slice(0, 5)
                        .map(transformNotification)
                );
    
                res.status(200).json({new: newNotifications, old: oldNotifications});
            } else{
                res.status(200).json({ message: "No notifications found." });
            }
        } catch(e){
            next(e);
        }
    }

    async updateProfile(req, res, next) {
        try{
            const update = { 
                username: req.body.username, 
                name: req.body.name,
                description: req.body.description,
                private: {
                    isProfilePrivate: req.body.isProfilePrivate, 
                    isLikedVideosPrivate: req.body.isLikedVideosPrivate,
                    isRepostedVideosPrivate: req.body.isRepostedVideosPrivate
                }, 
                allowToMessage: (req.body.allowToMessage === "everyone" || 
                    req.body.allowToMessage === "friends" || 
                    req.body.allowToMessage === "no one") 
                    ? req.body.allowToMessage 
                    : null 
            }
            const updateUser = await profileService.updateProfile(req.user.userId, update);
            res.status(200).json(new UserDto(updateUser));
        } catch(e){
            next(e);
        }
    }

    async updatePicture(req, res, next) {
        try{
            if (!req.file) {
                next(ApiError.BadRequest("No file uploaded."));
            }

            await profileService.uploadPicture(req.file, req.user.username);

            res.status(200).send({ message: "Profile picture updated successfully." });
        } catch(e){
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            next(e);
        }
    }

    async getUserPicture(req, res, next) {
        try{
            const path = await profileService.userPicture(req.params.username);
            res.sendFile(path);
        } catch(e){
            next(e);
        }
    }

    async followProfile(req, res, next) {
        try {
            const { username } = req.params;
            
            const hasFollowed = await profileService.followProfile(req.user.userId, username);

            res.status(200).json({ message: `You ${hasFollowed ? "unfollowed" : "followed"} successfully.` });
        } catch(e) {
            next(e);
        }
    }
}


async function transformNotification(notify) {
    let notifyObj = notify.toObject();
    
    if (notifyObj.sender.isSender) {
        const user = await UserSchema.findOne({ userId: notifyObj.sender.senderId });
        if (user) {
            notifyObj.sender.username = user.username;
        }
    }
    
    if (notifyObj.comment.isComment && notifyObj.video.isVideo) {
        const video = await VideoSchema.findOne({ videoId: notifyObj.video.videoId });
        if (video) {
            notifyObj.comment.content = video.comments.find(comment => comment.commentId === notifyObj.comment.commentId).content;
        }
    }
    
    return notifyObj;
}

module.exports = new ProfileController();