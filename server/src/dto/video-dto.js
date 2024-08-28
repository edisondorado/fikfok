module.exports = class VideoDto{
    videoId;
    name;
    authorId;
    author;
    views;
    commentsAllowed;
    comments;
    time;
    duration;
    likes;
    isPinned;
    favorites;
    reposts;
    visibility;

    constructor(model) {
        this.videoId = model.videoId;
        this.name = model.name;
        this.authorId = model.authorId;
        this.author = null;
        this.commentsAllowed = model.commentsAllowed;
        this.comments = model.comments.length;
        this.time = model.time;
        this.duration = model.duration;
        this.isPinned = model.isPinned;
        this.likes = model.likes.length;
        this.views = model.views.length;
        this.reposts = model.reposts.length;
        this.favorites = model.favorites.length;
        this.visibility = model.visibility;
    }
}