const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const { UserSchema, VideoSchema } = require("../database/model");
const ApiError = require("../exceptions/api-error");
const UserDto = require('../dto/user-dto');
const notificationService = require("./notification-service");
const { imageExtensions } = require("../config/extensions");

class ProfileService {
    async getProfile(username, fromUser) {
        const user = await UserSchema.findOne({ username });
        if (!user) throw ApiError.BadRequest("User not found");

        let likes = 0; 
        const videos = await VideoSchema.find({ authorId: user.userId})
        if (videos) {
            likes = videos.reduce((acc, video) => acc + video.likes.length, 0);
        }

        const userDto = new UserDto(user);
        userDto.ownProfile = fromUser ? fromUser.username === user.username : false;
        userDto.likes = likes;

        return userDto;
    }

    async updateProfile(userId, updates){
        const user = await UserSchema.findOne({ userId });
        if (!user) throw ApiError.BadRequest("User not found");

        if (updates.username !== user.username) {
            const oldUsername = user.username;
            const newUsername = updates.username;
            const oldFilePath = findImageFile("uploads/profile/picture", oldUsername);
            if (oldFilePath){
                const oldExtension = path.extname(oldFilePath);
                const newFilePath = path.join("uploads/profile/picture", `${newUsername}${oldExtension}`);

                fs.rename(oldFilePath, newFilePath, (err) => {
                    if (err) throw ApiError.ServerError(err);
                });
            } 
        }

        const filteredUpdate = filterNullUndefined(updates)
        return await UserSchema.findOneAndUpdate({ userId }, filteredUpdate, { new: true });
    }

    async uploadPicture(file, username){
        if (!file) throw ApiError.BadRequest("No file provided");

        const metadata = await sharp(file.buffer).metadata();
        if (metadata.width > "2048" || metadata.height > "2048") {
            throw ApiError.BadRequest("Image size should not exceed 2048x2048");
        }

        const folderPath = `uploads/profile/picture`;
        const filePath = path.join(folderPath, `${username}${path.extname(file.originalname)}`);

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await sharp(file.buffer)
            .toFile(filePath);
        
        return filePath;
    }

    async userPicture(username){
        let filePath
        filePath = findImageFile('uploads/profile/picture', username);

        const user = await UserSchema.findOne({ userId: username });

        if (!filePath && !user) {
            throw ApiError.BadRequest("User picture not found");
        } else if (user) {
            filePath = findImageFile('uploads/profile/picture', user.username);
        }

        const absolutePath = path.resolve(filePath);

        return absolutePath;
    }

    async followProfile(userId, username){
        const user = await UserSchema.findOne({ username });
        if (!user) throw ApiError.BadRequest("User not found.");

        const follower = await UserSchema.findOne({ userId });
        if (!follower) throw ApiError.BadRequest("Follower not found.");

        if (user.userId === userId) throw ApiError.BadRequest("You cannot follow yourself.");
        
        const hasFollowed = user.followers.find(follower => follower.userId === userId);

        if (hasFollowed){
            user.followers = user.followers.filter(follower => follower.userId !== userId);
            follower.follows = follower.follows.filter(follower => follower.userId !== user.userId)
        } else {
            user.followers.push({ userId });
            follower.follows.push({ userId: user.userId });
            await notificationService.createNotification({
                type: "follow",
                userId: user.userId,
                content: `${follower.username} follows you`,
                senderId: userId,
            });
        }

        await user.save();
        await follower.save();
        return hasFollowed;
    }
}

const findImageFile = (directory, username) => {
    for (const extension of imageExtensions) {
        const filePath = path.join(directory, `${username}${extension}`);
        if (fs.existsSync(filePath)) {
            return filePath;
        }
    }
    return null;
};

function filterNullUndefined(obj) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    const filteredObj = {};

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const filteredValue = filterNullUndefined(obj[key]);
        
            if (filteredValue !== null && filteredValue !== undefined) {
                if (typeof filteredValue === 'object' && !isEmptyObject(filteredValue)) {
                    filteredObj[key] = filteredValue;
                } else if (typeof filteredValue !== 'object') {
                    filteredObj[key] = filteredValue;
                }
            }
        }
    }

    return filteredObj;
}

function isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
}

module.exports = new ProfileService();