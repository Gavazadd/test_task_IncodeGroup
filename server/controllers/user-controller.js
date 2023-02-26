const userService = require('../service/user-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const {email, password, role} = req.body;
            let isFree
            if (role === "BOSS" || role === "ADMIN"){
                isFree = false
            }
            const userData = await userService.registration(email, password, role , isFree);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await userService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async getUsers(req, res, next) {
        try {
            let {role, userId} = req.query
            let users
            if (role === "ADMIN") {
                users = await userService.getAllUsers();
            }
            if (role === "BOSS") {
                users = await userService.getAllSubordinates(userId);
            }
            if (role === "USER") {
                const user = await userService.getUser(userId);
                users = [user]
            }
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }


    async getFreeUsers(req, res, next) {
        try {
            const users = await userService.getFreeUser();
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }

    async makeSubordinated(req, res, next) {
        try {
            let {bossId, userId} = req.body
            const users = await userService.makeSubordinate(bossId, userId);
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }

    async changeBoss(req, res, next) {
        try {
            let {bossId, newBossId} = req.body
            const users = await userService.changeBoss(bossId, newBossId);
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }


}


module.exports = new UserController();
