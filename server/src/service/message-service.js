const { v4: uuidv4 } = require('uuid');
const events = require('events');

const emitter = new events.EventEmitter();

const { MessageSchema, UserSchema } = require("../database/model");
const MessageDto = require('../dto/message-dto');
const ApiError = require("../exceptions/api-error");

class MessageService {
    async getMessageHistory(username, userId, lastMessageId){
        const firstUser = await UserSchema.findOne({ username });
        const secondUser = await UserSchema.findOne({ userId });

        let messages = await MessageSchema.find({ 
            $or: [
                { receiverId: firstUser.userId, senderId: secondUser.userId },
                { receiverId: secondUser.userId, senderId: firstUser.userId }
            ]
        })

        if (lastMessageId){
            const lastMessageIndex = messages.findIndex(msg => (msg.receiverId === lastMessageId || msg.senderId === lastMessageId));
            if (lastMessageIndex !== -1) {
                comments = comments.slice(lastMessageIndex + 1);
            }
        }

        const messagesData = messages.slice(0, 15).map(msg => new MessageDto(msg));

        return messagesData;
    }

    async getMessage(username, userId){
        emitter.once("newMessage", async (message) => {
            const firstUser = await UserSchema.findOne({ username });
            const secondUser = await UserSchema.findOne({ userId });

            if (!firstUser || !secondUser) return false;
            if (firstUser.userId === message.receiverId && secondUser.userId === message.senderId || firstUser.userId === message.senderId && secondUser.userId === message.receiverId) {
                return message;
            }
        })
    }

    async sendMessage(content, isVideo, videoId, senderId, receiverId){
        const receiver = await UserSchema.findOne({ userId: receiverId });
        const sender = await UserSchema.findOne({ userId: senderId });
        if (!receiver || !sender) return false;

        if (receiver.allowToMessage === "everyone" || (receiver.allowToMessage === "friends" && receiver.followers.find(f => f.userId === senderId) && sender.followers.find(f => f.userId === receiverId))){
            await MessageSchema.create({
                messageId: uuidv4(),
                senderId,
                receiverId,
                content,
                repost: {
                    isRepost: isVideo,
                    videoId: isVideo ? videoId : null,
                }
            })
                .then(message => emitter.emit("newMessage", new MessageDto(message) ));
        } else {
            throw ApiError.BadRequest("You can't send message this user.");
        }
    }
}

module.exports = new MessageService();