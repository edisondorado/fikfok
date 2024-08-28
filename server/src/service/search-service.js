const VideoDto = require("../dto/video-dto");
const UserDto = require("../dto/user-dto");

const { UserSchema, VideoSchema } = require("../database/model");

class SearchService {
    async findAll(query) {
        const regex = new RegExp(query, 'i');
    
        const userResults = await UserSchema.find({
            $or: [
                { username: { $regex: regex } },
                { name: { $regex: regex } }
            ]
        }).limit(15)

        const videoResults = await VideoSchema.find({
            name: { $regex: regex },
        }).limit(15)

        const userDtos = userResults.map(user => new UserDto(user) )
        const videoDtos = videoResults.map(video => new VideoDto(video) )
        
        return [userDtos, videoDtos]
    }

    async findProfile(query){
        const regex = new RegExp(query, 'i');
    
        const userResults = await UserSchema.find({
            $or: [
                { username: { $regex: regex } },
                { name: { $regex: regex } }
            ]
        }).limit(15)

        const userDtos = userResults.map(user => new UserDto(user) )

        return userDtos
    }

    async findVideo(query){
        const regex = new RegExp(query, 'i');
    
        const videoResults = await VideoSchema.find({
            name: { $regex: regex },
        }).limit(15)

        const videoDtos = videoResults.map(video => new VideoDto(video) )

        return videoDtos
    }
}

module.exports = new SearchService();