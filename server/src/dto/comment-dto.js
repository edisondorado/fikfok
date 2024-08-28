module.exports = class CommentDto {
    authorId;
    authorUsername;
    commentId;
    content;
    hadEdit;
    time;
    isReply;
    replyId;

    constructor(model) {
        this.authorId = model.authorId;
        this.authorUsername = model.authorUsername
        this.commentId = model.commentId;
        this.content = model.content;
        this.hadEdit = model.hadEdit;
        this.time = model.time;
        this.isReply = model.reply.isReply;
        this.replyId = model.reply.commentId;
    }
}