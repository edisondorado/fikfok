const { notificationTypes } = require("../config/notifications");
const { NotificationSchema } = require("../database/model");

class NotificationService {
    async createNotification({ type, userId, content, senderId, videoId, commentId, systemName }){
        if (senderId === userId) return;
        if (!notificationTypes.includes(type) || !type) throw new Error("Invalid notification type or type is missing");
        if (!userId) throw new Error("User id is required");
        if (!content) throw new Error("Content is required");

        if (!senderId && !systemName) throw new Error("SenderId or system name is required");
        if (senderId && systemName) throw new Error("Only senderId or system name can be provided");

        if (type === "like" && (!videoId && !commentId)) throw new Error("VideoId or commentId is required for like notification");
        if (type === "reply" && !commentId) throw new Error("CommentId is required for reply notification");
        if (type === "mention" && (!videoId && !commentId)) throw new Error("VideoId or commentId is required for mention notification");

        const recentNotification = await NotificationSchema.findOne({
            userId,
            type,
            time: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // last 60 seconds
        });

        if (recentNotification) return;

        const notification = {
            type,
            content,
            userId
        };

        if (videoId) notification.video = {isVideo: true, videoId};
        if (commentId) notification.comment = {isComment: true, commentId};
        if (senderId) notification.sender = {isSender: true, senderId};
        if (systemName) notification.system = {isSystem: true, name: systemName};

        return await NotificationSchema.create(notification)
    }
}

module.exports = new NotificationService();