const jwt = require("jsonwebtoken");
const { TokenSchema } = require("../database/model");

class TokenService {
    generateToken(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME
        });

        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME
        });

        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await TokenSchema.findOne({
            userId
        })
        if (tokenData){
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }

        const token = await TokenSchema.create({
            userId: userId,
            refreshToken: refreshToken
        })
        return token;
    }

    async removeToken(refreshToken) {
        const tokenData = await TokenSchema.findOneAndDelete({
            refreshToken
        });
        return tokenData;
    }

    async findToken(refreshToken) {
        const tokenData = await TokenSchema.findOne({
            refreshToken
        });
        return tokenData;
    }

    validateAccessToken(token) {
        try{
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return userData;
        } catch(e){
            return null;
        }
    }

    validateRefreshToken(token) {
        try{
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return userData;
        } catch(e){
            return null;
        }
    }
}

module.exports = new TokenService();