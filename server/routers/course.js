const router = require('koa-router')();
const courseController = require('./../controllers/course');

const routers = router
    .get('/detail/:id', courseController.getCourseDetailById)
    .post('/signUpCourse', courseController.signUpCourse)
    .get('/courseMainInfo', courseController.getCourseMainInfo)
    .post('/collectCourse', courseController.collectCourse)
    .post('/releaseComment', courseController.releaseComment)
    .get('/notesData', courseController.getCourseNotes)
    .get('/noteComment', courseController.getNoteComment)
    .get('/discussData', courseController.getDiscussData)
    .get('/discussItem', courseController.getDiscussItem)
    .post('/addDiscuss', courseController.addDiscuss)
    .post('/updateDiscuss', courseController.updateDiscuss)
    .delete('/deleteDiscuss', courseController.deleteDiscuss)
    .get('/testData', courseController.getTestData)
    .post('/checkTestData', courseController.checkTestData)
    .get('/danmu', courseController.getDanMuByLessonId)
    .post('/addDanMu', courseController.addDanMu);

module.exports = routers;
