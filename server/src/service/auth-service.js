const bcrypt = require("bcrypt");
const uuid = require("uuid");

const { UserSchema } = require("../database/model"); 

const ApiError = require("../exceptions/api-error");
const AuthDto = require("../dto/auth-dto");
const MailService = require("./mail-service");
const TokenService = require("./token-service");

class AuthService {
    async signup(email, password, username) {
        const docUser = await UserSchema.findOne({ email });
        if (docUser){
            throw ApiError.BadRequest("Email already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const activationLink = uuid.v4();
        const userId = uuid.v4();

        const user = await UserSchema.create({
            userId,
            email: email,
            password: hashedPassword,
            username: username,
            name: username,
            activation: {link: activationLink},
            region: "KZ"
        })
        
        await MailService.sendActivationEmail(email, `${process.env.API_URL}/auth/activate/${activationLink}`);

        const authDto = new AuthDto(user);
        const tokens = TokenService.generateToken({ ...authDto });
        await TokenService.saveToken(authDto.userId, tokens.refreshToken);

        return {
            ...tokens,
            user: authDto
        }
    }

    async signin(email, password) {
        const user = await UserSchema.findOne({ email });
        if (!user) {
            throw ApiError.BadRequest("User not found");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw ApiError.BadRequest("Invalid password");
        }

        const authDto = new AuthDto(user);
        const tokens = TokenService.generateToken({ ...authDto });
        await TokenService.saveToken(authDto.userId, tokens.refreshToken);

        return {...tokens, user: authDto}
    }

    async logout(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const token = await TokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = TokenService.validateRefreshToken(refreshToken);
        const tokenDB = await TokenService.findToken(refreshToken);

        if (!userData || !tokenDB) {
            throw ApiError.UnauthorizedError();
        }

        const user = await UserSchema.findOne({ userId: userData.userId });

        const authDto = new AuthDto(user);
        const tokens = TokenService.generateToken({...authDto });
        await TokenService.saveToken(authDto.userId, tokens.refreshToken);
        return {...tokens, user: authDto}
    }

    async activate(activationLink){
        const user = await UserSchema.findOne({ 'activation.link': activationLink, 'activation.isActivated': false });
        if (!user){
            throw ApiError.BadRequest("User not found");
        }

        user.activation.isActivated = true;
        await user.save();
    }
}

module.exports = new AuthService();