const fs = require("fs");
const path = require("path");
const { imageExtensions } = require("../config/extensions");

const findImageFile = (directory, username) => {
    for (const extension of imageExtensions) {
        const filePath = path.join(directory, `${username}${extension}`);
        if (fs.existsSync(filePath)) {
            return filePath;
        }
    }
    return null;
};

module.exports = class UserDto {
    userId;
    isActivated;
    name;
    username;
    description;
    allowToMessage;
    profilePicture;
    follows;
    followers;
    private;
    likedVideos;
    repostedVideos;

    constructor(model) {
        this.userId = model.userId;
        this.isActivated = model.activation.isActivated;
        this.name = model.name;
        this.username = model.username;
        this.description = model.description;
        this.allowToMessage = model.allowToMessage;
        this.profilePicture = findImageFile("uploads/profile/picture", model.username);
        this.follows = model.follows;
        this.followers = model.followers;
        this.private = model.private;

        if (model.private.isLikedVideosPrivate === false) {
            this.likedVideos = model.likedVideos;
        } else {
            this.likedVideos = [];
        }
        if (model.private.isRepostedVideosPrivate === false) {
            this.repostedVideos = model.repostedVideos;
        } else {
            this.repostedVideos = [];
        }
    }
}
