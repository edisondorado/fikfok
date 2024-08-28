const ApiError = require('../exceptions/api-error');
const messageService = require('../service/message-service');

class MessageController {
    async getMessageHistory(req, res, next) {
        try{
            const { username } = req.params;
            const { lastMessageId } = req.body;

            const messages = await messageService.getMessageHistory(username, req.user.userId, lastMessageId);

            res.status(200).json(messages);
        } catch(e){
            next(e);
        }
    }

    async getMessage(req, res, next) {
        try{
            const { username } = req.params;
            const message = await messageService.getMessage(username, req.user.userId);

            res.status(200).json(message);
        } catch(e){
            next(e);
        }
    }

    async sendMessage(req, res, next) {
        try{
            const { content, isVideo, videoId, receiverId } = req.body;
            if (!content && !isVideo) next(ApiError.BadRequest("Content or video ID is required"));
            if (isVideo && !videoId) next(ApiError.BadRequest("Video ID is required for sending a video message"));

            await messageService.sendMessage(content, isVideo, videoId, req.user.userId, receiverId);

            res.status(200).json({ message: "Message sent successfully." });
        } catch(e){
            next(e);
        }
    }
}

module.exports = new MessageController();