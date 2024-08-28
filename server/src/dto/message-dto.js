module.exports = class MessageDto {
    messageId;
    content;
    senderId;
    receiverId;
    time;
    isRepost;
    videoId;

    constructor(model){
        this.messageId = model.messageId;
        this.content = model.content;
        this.senderId = model.senderId;
        this.receiverId = model.receiverId;
        this.time = model.time;
        this.isRepost = model.repost.isRepost;
        if (model.repost.isRepost) 
            this.videoId = model.repost.videoId;
        else
            this.videoId = null;
    }
}