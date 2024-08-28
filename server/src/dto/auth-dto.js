module.exports = class AuthDto {
    userId;
    email;
    username;
    isActivated;
    name;
    description;
    allowToMessage;
    follows;
    followers;
    private;
    likedVideos;
    favorites;
    repostedVideos;

    constructor(model){
        this.userId = model.userId;
        this.email = model.email;
        this.username = model.username;
        this.isActivated = model.activation.isActivated;
        this.name = model.name;
        this.description = model.description;
        this.allowToMessage = model.allowToMessage;
        this.follows = model.follows;
        this.followers = model.followers;
        this.private = model.private;
        this.likedVideos = model.likedVideos;
        this.favorites = model.favorites;
        this.repostedVideos = model.repostedVideos;
    }
}