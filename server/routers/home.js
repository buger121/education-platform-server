const router = require('koa-router')();
const courseController = require('./../controllers/course');

const routers = router
    .get('/getcourseList', courseController.getCourse)
    .get('/getCourseIds', courseController.getCourseIds);

module.exports = routers;
