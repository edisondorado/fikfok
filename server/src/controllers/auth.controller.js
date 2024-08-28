const { validationResult } = require("express-validator");

const ApiError = require("../exceptions/api-error");
const AuthService = require("../service/auth-service");

class AuthController{
    async signup(req, res, next) {
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()){
                return next(ApiError.BadRequest("Validation error", errors.array()));
            }
            const { email, password, username } = req.body;
            const userData = await AuthService.signup(email, password, username);
            res.cookie("refreshToken", userData.refreshToken, { maxAge: process.env.JWT_REFRESH_EXPIRATION_TIME_MILLISECONDS, httpOnly: true });
            res.json(userData);
        } catch(e){
            next(e);
        }
    }

    async signin(req, res, next) {
        try{
            const { email, password } = req.body;
            const userData = await AuthService.signin(email, password);

            res.cookie("refreshToken", userData.refreshToken, { maxAge: process.env.JWT_REFRESH_EXPIRATION_TIME_MILLISECONDS, httpOnly: true });
            res.json(userData);
        } catch(e){
            next(e);
        }
    }

    async signout(req, res, next) {
        try{
            const { refreshToken } = req.cookies;
            const token = await AuthService.logout(refreshToken);
            res.clearCookie("refreshToken");
            res.status(200).json(token)
        } catch(e){
            next(e);
        }
    }

    async activate(req, res, next) {
        try{
            const activationLink = req.params.link;
            await AuthService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL)
        } catch(e){
            next(e);
        }
    }

    async refresh(req, res, next) {
        try{
            const { refreshToken } = req.cookies;
            const userData = await AuthService.refresh(refreshToken);
            res.cookie("refreshToken", userData.refreshToken, { maxAge: process.env.JWT_REFRESH_EXPIRATION_TIME_MILLISECONDS, httpOnly: true });
            res.json(userData);
        } catch(e){
            next(e);
        }
    }
}

module.exports = new AuthController();