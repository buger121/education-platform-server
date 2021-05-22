/** 用户业务操作 */
const jwt = require('jsonwebtoken');
const userModel = require('./../models/user-info');
const userCode = require('./../codes/user');
const { updateUserInfo, getOrders } = require('../controllers/user-info');

const user = {
    /**
     * 创建用户
     * @param {object} user     用户对象
     * @return {object}         创建结果
     */
    async create(user) {
        let result = await userModel.create(user);
        return result;
    },

    /**
     *
     * 查找存在用户信息
     * @param {object} formData     查找的表单数据
     * @return {object|null}        查找结果
     */
    async getExistOne(formData) {
        let resultData = await userModel.getExistOne({
            phone: formData.phone,
        });
        return resultData;
    },

    /**
     *
     * 登录业务操作
     * @param {object} formData     登录表单信息
     * @return {object}             登录结果
     */
    async signIn(formData) {
        let resultData = await userModel.getOneByPhoneAndPsw({
            phone: formData.phone,
            password: formData.password,
        });
        return resultData;
    },

    /**
     *
     *  根据用户id查找用户信息
     * @param {string} id     用户id
     * @return {obejct|null}        查找结果
     */
    async getUserInfoById(id) {
        let resultData = (await userModel.getUserInfoById(id)) || {};
        let userInfo = {
            email: resultData.email,
            username: resultData.name,
            detailInfo: resultData.detail_info,
            sex: resultData.sex,
            qqNumber: resultData.qq,
            phone: resultData.phone,
            avatar: resultData.avatar,
        };
        return userInfo;
    },

    async updateUserInfo(userid, data) {
        const result = await userModel.updateUserInfo(userid, data);
        return result;
    },

    async getOrders(userId) {
        const result = await userModel.getOrders(userId);
        return result;
    },

    async getCourse(userId) {
        const result = await userModel.getCourse(userId);
        return result;
    },

    async getCollectCourse(userId) {
        const result = await userModel.getCollectCourse(userId);
        return result;
    },

    async getInteractive(userId) {
        const result = await userModel.getInteractive(userId);
        return result;
    },

    async readMessage(userId) {
        const result = await userModel.readMessage(userId);
        return result;
    },

    validatorSignUp(userInfo) {
        let result = {
            success: false,
            message: '',
        };

        if (/[0-9]{11}/.test(userInfo.phone) === false) {
            result.message = userCode.ERROR_PHONE;
            return result;
        }
        if (!/[0-9a-z]{6,16}/.test(userInfo.password)) {
            result.message = userCode.ERROR_PASSWORD;
            return result;
        }
        if (userInfo.password !== userInfo.confirmPassword) {
            result.message = userCode.ERROR_PASSWORD_CONFORM;
            return result;
        }

        result.success = true;
        return result;
    },

    /**
     *
     * 解析token，获取用户相关信息
     * @param {object} ctx
     * @return {object|null} token解析结果
     */
    decodeToken(ctx) {
        const token = ctx.header.authorization;
        try {
            const decode = jwt.verify(token, 'secret');
            return decode;
        } catch (err) {
            console.log(err);
        }
    },
};

module.exports = user;
