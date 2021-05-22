const dbUtils = require('./../utils/db-util');

const user = {
    /**
     * 数据库创建用户
     * @param {object} model    用户数据模型
     * @return {object}         mysql执行结果
     */
    async create(model) {
        let result = await dbUtils.insertData('user_info', model);
        return result;
    },

    /**
     *
     * 查找一个已存在用户的数据
     * @param {object} options      查找条件参数
     * @return {object | null}      查找结果
     */
    async getExistOne(options) {
        let _sql = `
        SELECT * FROM user_info WHERE phone = "${options.phone}" LIMIT 1
        `;
        let result = await dbUtils.query(_sql);
        if (Array.isArray(result) && result.length > 0) {
            result = result[0];
        } else {
            result = null;
        }
        return result;
    },

    /**
     *
     * 根据用户名和密码查找用户
     * @param {object} options      用户名和密码
     * @return {object|null}        查找结果
     */
    async getOneByPhoneAndPsw(options) {
        let _sql = `
        SELECT * FROM user_info WHERE phone = "${options.phone}" AND 
        password = "${options.password}" LIMIT 1
        `;
        let result = await dbUtils.query(_sql);
        if (Array.isArray(result)) {
            result = result[0];
        } else {
            result = null;
        }
        return result;
    },

    /**
     *
     * 根据用户id查找
     * @param {string} userName     用户id
     * @return {object|null}        查找结果
     */
    async getUserInfoById(id) {
        const _sql = `
            SELECT * from user_info WHERE id = ${id}
        `;
        let result = await dbUtils.query(_sql);
        if (Array.isArray(result)) {
            result = result[0];
        } else {
            result = null;
        }
        return result;
    },

    async updateUserInfo(id, userInfo) {
        let result = {
            success: false,
            code: '',
        };
        const _sql = `
            UPDATE user_info SET name = ?, sex = ?, detail_info = ?, 
            qq = ?, email = ?, phone = ?, avatar = ? WHERE user_info.id = ${id}
        `;
        const res = await dbUtils.query(_sql, [
            userInfo.username,
            userInfo.sex,
            userInfo.userIntro,
            userInfo.qqNumber,
            userInfo.email,
            userInfo.phone,
            userInfo.avatar,
        ]);
        if (res.affectedRows === 1) {
            result.success = true;
        } else {
            result.code = 'UPDATE ERROR';
        }
        return result;
    },

    async getOrders(userId) {
        const _sql = `
        SELECT * FROM user_order WHERE userId = ${userId}
        `;
        const res = await dbUtils.query(_sql);
        return res;
    },

    async getCourse(userId) {
        const _sql1 = `
        SELECT course FROM user_info WHERE id = ${userId}
        `;
        const res = await dbUtils.query(_sql1);
        let courseArr = [];
        if (res[0].course) {
            courseArr = res[0].course.split(',');
        }
        const _sql2 = `
        SELECT * FROM course_detail WHERE course_id in (${courseArr})
        `;
        const courseData = await dbUtils.query(_sql2);
        return courseData;
    },

    async getCollectCourse(userId) {
        const _sql1 = `
        SELECT collect FROM user_info WHERE id = ${userId}
        `;
        const res = await dbUtils.query(_sql1);
        let courseArr = [];
        if (res[0].collect) {
            courseArr = res[0].collect.split(',');
        }
        const _sql2 = `
        SELECT * FROM course_detail WHERE course_id in (${courseArr})
        `;
        const courseData = await dbUtils.query(_sql2);
        return courseData;
    },

    async getInteractive(userId) {
        const _sql = `
        SELECT * FROM user_interactive inte, course_discuss disc
        WHERE inte.discussId = disc.discussID AND disc.userId = ${userId}
        `;
        let replyedInfoArr = [];
        try {
            replyedInfoArr = await dbUtils.query(_sql);
        } catch (err) {
            console.log(err);
        }
        return replyedInfoArr;
    },

    async readMessage(userId) {
        const value = { viewed: 0 };
        const _sql = `
        UPDATE ?? SET ? WHERE receiveUser = ?
        `;
        await dbUtils.query(_sql, ['user_interactive', value, userId]);
        return {
            success: true,
        };
    },

    async addMessage(addData) {
        await dbUtils.insertData('user_interactive', addData);
    },
};

module.exports = user;
