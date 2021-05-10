const userInfoService = require('./../services/user-info');
const userCode = require('./../codes/user');
const crypto = require('crypto-js');
const config = require('./../../config');
const jwt = require('jsonwebtoken');
const store = require('./../utils/oss-utils');
const path = require('path');
const fs = require('fs');

function getUserId(ctx) {
    let token = ctx.headers.authorization;
    if (token.indexOf('Bearer') !== -1) {
        token = token.split(' ')[1];
    }
    const decode = jwt.decode(token, 'secret');
    const userId = decode.id;
    return userId;
}

module.exports = {
    /**
     *
     * 登录操作
     * @param {object} ctx
     */
    async singIn(ctx) {
        let formData = ctx.request.body;
        let result = {
            success: false,
            message: '',
            uid: '',
            code: '',
            token: '',
            username: '',
        };
        //对密码进行加密，再校验
        let psdMd5 = crypto
            .MD5(formData.password.toString(), [config.secret_key])
            .toString();
        formData.password = psdMd5;
        let userResult = await userInfoService.signIn(formData);
        if (userResult) {
            result.success = true;
            result.username = userResult.name;
            result.uid = userResult.id;
            const user = {
                id: userResult.id,
                name: userResult.name,
            };
            result.token = jwt.sign(user, 'secret', {
                expiresIn: '1h',
            });
        } else {
            result.message = userCode.FAIL_USER_NAME_OR_PASSWORD_ERROR;
            result.code = 'FAIL_USER_NAME_OR_PASSWORD_ERROR';
        }
        if (result.success === true) {
            let session = ctx.session;
            session.isLogin = true;
            session.phone = userResult.phone;
            session.user_id = userResult.id;
        } else {
            ctx.body = result;
        }
        ctx.body = result;
    },

    /**
     *
     * 注册操作
     * @param {object} ctx
     */
    async signUp(ctx) {
        let formData = ctx.request.body;
        let result = {
            success: false,
            message: '',
            data: null,
        };

        let validateResult = userInfoService.validatorSignUp(formData);
        if (validateResult.success === false) {
            result = validateResult;
            ctx.body = result;
            return;
        }

        let exsitOne = await userInfoService.getExistOne(formData);

        if (exsitOne) {
            if (exsitOne.phone == formData.phone) {
                result.message = userCode.FAIL_USER_NAME_IS_EXIST;
                ctx.body = result;
                return;
            }
        }
        //对密码进行加密处理
        const psdMd5 = crypto.MD5(formData.password.toString(), [
            config.secret_key,
        ]);
        let userResult = await userInfoService.create({
            phone: formData.phone,
            email: formData.email,
            password: psdMd5,
            name: formData.username,
            create_time: new Date().getTime(),
            level: 1,
        });

        if (userResult && userResult.insertId * 1 > 0) {
            result.success = true;
        } else {
            result.message = userCode.ERROR_SYS;
        }

        ctx.body = result;
    },

    /**
     *
     * 获取用户信息
     * @param {object} ctx
     */
    async getLoginUserInfo(ctx) {
        const token = ctx.header.authorization;
        try {
            const decode = jwt.verify(token, 'secret');
            const userInfo = await userInfoService.getUserInfoById(decode.id);
            ctx.body = userInfo;
        } catch (err) {
            //token失效
            ctx.status = 401;
            ctx.message = 'token expired';
            console.log(err);
        }
    },

    async updateUserInfo(ctx) {
        const userInfo = ctx.request.body;
        const decode = userInfoService.decodeToken(ctx);
        const userId = decode.id;
        //头像图片二次处理,修改文件名
        if (ctx.request.files.avatar) {
            const avatar = ctx.request.files.avatar;
            const myPath = avatar.path;
            const directName = path.dirname(myPath);
            const exeNameArr = avatar.name.split('.');
            const exeName = exeNameArr[exeNameArr.length - 1];
            const newPath = `${directName}\\${userId}.${exeName}`;
            fs.renameSync(myPath, newPath);
            try {
                //上传图片到oss
                const filePath = `user/${userId}/avatar.png`;
                await store.put(filePath, path.resolve(newPath));
                const avatarUrl = store.generateObjectUrl(filePath);
                userInfo.avatar = avatarUrl;
            } catch (err) {
                console.log(err);
            }
        }

        const res = await userInfoService.updateUserInfo(userId, userInfo);
        ctx.body = res;
    },

    async getOrders(ctx) {
        const userId = getUserId(ctx);
        const res = await userInfoService.getOrders(userId);
        ctx.body = res;
    },
};
