const UserModel = require('../models/user-model');
const SubordinateModel = require('../models/subordinate-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');

class UserService {
    async registration(email, password, role, isFree) {
        const candidate = await UserModel.findOne({email})
        if (candidate) {
            throw ApiError.BadRequest(`Користувач з такою поштою ${email} вже існує`)
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4(); // v34fa-asfasf-142saf-sa-asf

        const user = await UserModel.create({email, password: hashPassword, role, isFree, activationLink})
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

        const userDto = new UserDto(user); // id, email, role, isActivated
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink})
        if (!user) {
            throw ApiError.BadRequest('Некоректне посилання активації')
        }
        user.isActivated = true;
        await user.save();
    }

    async login(email, password) {
        const user = await UserModel.findOne({email})
        if (!user) {
            throw ApiError.BadRequest('Користувача з таким email не знайдено')
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Невірний пароль');
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const user = await UserModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }

    async getAllUsers() {
        const users = await UserModel.find();
        return users;
    }

    async getFreeUser() {
        const user = await UserModel.find({isFree: true});
        return user;
    }

    async getUser(userId) {
        const user = await UserModel.findOne({_id: userId});
        return user;
    }

    async getAllSubordinates(bossId) {
        const subordinatedUsers = await SubordinateModel.find({bossId});
        const user = await UserModel.findOne({_id: bossId});
        let users = [user]
        for (let i = 0; i< subordinatedUsers.length; i++ ){
            const user = await UserModel.findOne({_id: subordinatedUsers[i].userId});
            users.push(user)
        }
        return users;
    }

    async makeSubordinate(bossId, userId) {
        await UserModel.updateOne({_id:userId}, {isFree: "false"});
        const subordinate = await SubordinateModel.create({bossId, userId})
        return subordinate;
    }

    async changeBoss(bossId, newBossId) {
        const boss = await SubordinateModel.updateMany({bossId: bossId}, {bossId: newBossId})
        return boss;
    }

}

module.exports = new UserService();
