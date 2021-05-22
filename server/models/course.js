const dbUtils = require('./../utils/db-util');
const moment = require('moment');
const { max } = require('moment');

const course = {
    async getCourseList() {
        let _sql = `
            SELECT course_name, sub_course FROM course
        `;
        let result = await dbUtils.query(_sql);
        if (result) {
            return result;
        } else {
            console.log('err');
        }
    },

    async getCourseDetailList() {
        let _sql = `
            SELECT sub_course_name, sub_course_detail FROM sub_course
        `;
        let result = await dbUtils.query(_sql);
        if (result) {
            return result;
        } else {
            console.log('err');
        }
    },

    async getCourseDetailById(id) {
        let _sql = `
            SELECT * FROM course_detail WHERE course_id = ${id}
        `;
        let result = await dbUtils.query(_sql);
        if (Array.isArray(result)) {
            return result[0];
        } else {
            console.log('err');
        }
    },

    async getUserCourses(id) {
        let _sql = `
        SELECT course FROM user_info WHERE id = ${id}
        `;
        const result = await dbUtils.query(_sql);
        if (Array.isArray(result)) {
            return result[0];
        } else {
            console.log('err');
        }
    },

    async getCourseIds() {
        let _sql = `
            SELECT course_id, course_name from course
        `;
        const result = await dbUtils.query(_sql);
        return result;
    },

    async getCourseIdByUserId(userId) {
        let _sql = `
        SELECT course FROM user_info WHERE id = ${userId}
        `;
        const res = await dbUtils.query(_sql);
        return res;
    },

    async signUpCourse(userId, courseId) {
        const result = {
            success: false,
            code: '',
        };
        let _sql = `
        UPDATE user_info SET course = ? WHERE id = ${userId}
        `;
        const oldCourse = await this.getCourseIdByUserId(userId);
        let oldCourseArr = [];
        if (oldCourse[0].course) {
            oldCourseArr = oldCourse[0].course.split(',');
        }
        oldCourseArr.push(courseId);
        const newCourse = oldCourseArr.join(',');
        try {
            await dbUtils.query(_sql, newCourse);
            result.success = true;
            return result;
        } catch (err) {
            return result;
        }
    },

    async createOrder(userId, courseId) {
        const courseDetail = await this.getCourseDetailById(courseId);
        const orderData = {
            userId,
            date: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            name: courseDetail.name,
            price: courseDetail.price,
            payment: courseDetail.price,
            status: '交易完成',
        };
        await dbUtils.insertData('user_order', orderData);
    },

    async getCourseMainInfo(userId, courseId) {
        //1.获取课程目录
        let _sql = `
        SELECT * FROM course_catalog WHERE courseId = ${courseId}
        `;
        const catalog = await dbUtils.query(_sql);
        //2.获取用户学习进度
        let _sql2 = `
        SELECT * FROM user_lesson WHERE userId = ${userId}
        `;
        const progress = await dbUtils.query(_sql2);
        //3.获取课程评价
        let _sql3 = `
        SELECT * FROM course_comment WHERE courseID = ${courseId}
        `;
        const comment = await dbUtils.query(_sql3);
        return { catalog, progress, comment };
    },

    async collectCourse(userId, updateVal) {
        const result = {
            success: false,
        };
        const res = await dbUtils.updateData('user_info', updateVal, userId);
        if (res.affectedRows === 1) {
            result.success = true;
        }
        return result;
    },

    async releaseComment(commentData) {
        const result = {
            success: false,
        };
        const res = await dbUtils.insertData('course_comment', commentData);
        if (res.affectedRows === 1) {
            result.success = true;
        }
        return result;
    },

    async getCourseNotes(userId, courseId) {
        //1.获取笔记基本信息
        let _sql = `
        SELECT * FROM course_notes WHERE courseId = ${courseId}
        `;
        const res = await dbUtils.query(_sql);
        for (let i = 0; i < res.length; i++) {
            if (res[i].like && res[i].noteComment) {
                const likeNum = res[i].like.split(',').length;
                const commentNum = res[i].noteComment.split(',').length;
                res[i].likeNum = likeNum;
                res[i].commentNum = commentNum;
            } else {
                res[i].likeNum = 0;
                res[i].commentNum = 0;
            }

            //2.获取课时信息
            let _sql2 = `
        SELECT courseNum FROM course_catalog WHERE lessonId = ${res[i].lessonId}
        `;
            const lessonIndex = await dbUtils.query(_sql2);
            res[i].lessonIndex = lessonIndex[0].courseNum;
        }

        return res;
    },

    async getNoteComment(noteId) {
        const _sql = `
        SELECT * FROM note_comment WHERE noteId = ${noteId}
        `;
        const res = await dbUtils.query(_sql);
        return res;
    },

    async getDiscussData(courseId) {
        const _sql = `
        SELECT * FROM course_discuss WHERE courseId = ${courseId}
        `;
        const res = await dbUtils.query(_sql);
        return res;
    },

    async getDiscussItem(discussId) {
        const _sql = `
        SELECT * FROM course_discuss WHERE discussId = ${discussId}
        `;
        const res = await dbUtils.query(_sql);
        return res;
    },

    async addDiscuss(discussData) {
        const result = {
            success: false,
        };
        const res = await dbUtils.insertData('course_discuss', discussData);
        if (res.affectedRows === 1) {
            result.success = true;
        }
        //获取刚插入的discussId
        const _sql = `
        SELECT max(discussId) AS maxId FROM course_discuss
        `;
        const maxIdItem = await dbUtils.query(_sql);
        result.maxId = maxIdItem[0].maxId;
        return result;
    },

    async updateDiscuss(params) {
        const result = {
            success: false,
        };
        const _sql1 = `
        SELECT * FROM course_discuss WHERE discussId = ${params.discussId}
        `;
        const discussData = await dbUtils.query(_sql1);
        const likes = discussData[0].like.split(',');
        switch (params.attr) {
            case 'like':
                //修改点赞
                const index = likes.indexOf(String(params.userId));
                if (index !== -1) {
                    likes.splice(index, 1);
                } else {
                    likes.push(String(params.userId));
                }
                discussData[0].like = likes.join(',');
                break;
            case 'reply':
                //添加回复id
                if (discussData[0].reply) {
                    discussData[0].reply =
                        discussData[0].reply + ',' + params.addReplyId;
                } else {
                    discussData[0].reply = params.addReplyId;
                }
                break;
        }
        const _sql2 = 'UPDATE ?? SET ? WHERE discussId = ?';
        const res = await dbUtils.query(_sql2, [
            'course_discuss',
            discussData[0],
            params.discussId,
        ]);
        if (res.affectedRows === 1) {
            result.success = true;
        }
        return result;
    },

    async updateSpecficDiscuss(newDiscuss) {
        let _sql = 'UPDATE ?? SET ? WHERE discussId = ?';
        await dbUtils.query(_sql, [
            'course_discuss',
            newDiscuss,
            newDiscuss.discussId,
        ]);
    },

    async deleteDiscuss(discussId) {
        let result = {
            success: false,
        };
        //删除评论记录
        const _sql = `
        DELETE FROM course_discuss WHERE discussId in (${discussId})
        `;
        //删除交互表中相关的记录
        const _sql2 = `
        DELETE FROM user_interactive WHERE discussId in (${discussId})
        `;
        const res = await dbUtils.query(_sql);
        await dbUtils.query(_sql2);
        if (res.affectedRows >= 1) {
            result.success = true;
        }
        return result;
    },

    async getTestData(lessonId) {
        const _sql = `
        SELECT * FROM lesson_test WHERE lessonId = ${lessonId}
        `;
        const res = await dbUtils.query(_sql);
        return res;
    },

    async getDanMuByLessonId(lessonId) {
        const _sql = `
        SELECT * FROM lesson_danmu WHERE lessonId = ${lessonId}
        `;
        const res = await dbUtils.query(_sql);
        return res;
    },

    async addDanMu(danMuData) {
        const result = {
            success: false,
        };
        const res = await dbUtils.insertData('lesson_danmu', danMuData);
        if (res.affectedRows == 1) {
            result.success = true;
        }
        return result;
    },
};

module.exports = course;
