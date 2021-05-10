const router = require('koa-router')();
const courseController = require('./../controllers/course');

const routers = router
    .get('/detail/:id', courseController.getCourseDetailById)
    .post('/signUpCourse', courseController.signUpCourse)
    .get('/courseMainInfo', courseController.getCourseMainInfo)
    .post('/releaseComment', courseController.releaseComment)
    .get('/notesData', courseController.getCourseNotes)
    .get('/noteComment', courseController.getNoteComment)
    .get('/testData', courseController.getTestData)
    .post('/checkTestData', courseController.checkTestData);

module.exports = routers;
