const courseService = require('./../services/course');
const jwt = require('jsonwebtoken');
const config = require('./../../config');
const { getUserInfoById } = require('../models/user-info');

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
    async getCourse(ctx) {
        let result = await courseService.getCourseDetail();
        ctx.body = result;
    },
    async getCourseIds(ctx) {
        let result = await courseService.getCourseIds();
        ctx.body = result;
    },
    async getCourseDetailById(ctx) {
        const id = ctx.params.id; //课程id
        let result = await courseService.getCourseDetailById(id);
        let token = ctx.headers.authorization;
        try {
            const decode = jwt.verify(token, 'secret');
            //根据用户id获取其已选课程,校验当前课程是否被选中
            const user_id = decode.id;
            let user_courses = await courseService.getUserCourses(user_id);
            user_courses = user_courses.course.split(',');
            if (user_courses.indexOf(id) !== -1) {
                //已被选中
                result.isSignUp = true;
            } else {
                result.isSignUp = false;
            }
        } catch (err) {
            console.log(err);
        }
        ctx.body = result;
    },

    async signUpCourse(ctx) {
        const userId = getUserId(ctx);
        const courseId = Number(ctx.request.body.courseId);
        const res = await courseService.signUpCourse(userId, courseId);
        ctx.body = res;
    },

    async getCourseMainInfo(ctx) {
        const userId = getUserId(ctx);
        const courseId = Number(ctx.query.courseId);
        const res = await courseService.getCourseMainInfo(userId, courseId);
        ctx.body = res;
    },

    async collectCourse(ctx) {
        const userId = getUserId(ctx);
        const courseId = ctx.request.body.courseId;
        const res = await courseService.collectCourse(userId, courseId);
        ctx.body = res;
    },

    async releaseComment(ctx) {
        const commentData = ctx.request.body;
        const res = await courseService.releaseComment(commentData);
        ctx.body = res;
    },

    async getCourseNotes(ctx) {
        const userId = getUserId(ctx);
        const courseId = Number(ctx.query.courseId);
        const res = await courseService.getCourseNotes(userId, courseId);
        ctx.body = res;
    },

    async getDiscussData(ctx) {
        const courseId = Number(ctx.query.courseId);
        const res = await courseService.getDiscussData(courseId);
        ctx.body = res;
    },

    async getDiscussItem(ctx) {
        const discussId = Number(ctx.query.discussId);
        const res = await courseService.getDiscussItem(discussId);
        ctx.body = res;
    },

    async addDiscuss(ctx) {
        const userId = getUserId(ctx);
        const discussData = ctx.request.body;
        const res = await courseService.addDiscuss({ userId, ...discussData });
        ctx.body = res;
    },

    async updateDiscuss(ctx) {
        const userId = getUserId(ctx);
        const params = ctx.request.body;
        params.userId = userId;
        const res = await courseService.updateDiscuss(params);
        ctx.body = res;
    },

    async deleteDiscuss(ctx) {
        const discussId = ctx.query.discussId;
        const res = await courseService.deleteDiscuss(discussId);
        ctx.body = res;
    },

    async getNoteComment(ctx) {
        const noteId = Number(ctx.query.noteId);
        const res = await courseService.getNoteComment(noteId);
        ctx.body = res;
    },

    async getTestData(ctx) {
        const lessonId = Number(ctx.query.lessonId);
        const res = await courseService.getTestData(lessonId);
        ctx.body = res;
    },

    async checkTestData(ctx) {
        const userId = getUserId(ctx);
        const { lessonId, answers } = ctx.request.body;
        const res = await courseService.getTestData(lessonId, {
            userId,
            answers,
        });
        ctx.body = res;
    },

    async getDanMuByLessonId(ctx) {
        const lessonId = Number(ctx.query.lessonId);
        const res = await courseService.getDanMuByLessonId(lessonId);
        ctx.body = res;
    },

    async addDanMu(ctx) {
        const danMuData = ctx.request.body;
        const res = await courseService.addDanMu(danMuData);
        ctx.body = res;
    },
};
