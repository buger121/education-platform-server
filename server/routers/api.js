const router = require('koa-router')();
const userInfoController = require('./../controllers/user-info');

const routers = router
    .get('/user/getUserInfo/:user_id', userInfoController.getLoginUserInfo)
    .post('/user/updateUserInfo', userInfoController.updateUserInfo)
    .post('/user/signIn', userInfoController.singIn)
    .post('/user/signUp', userInfoController.signUp)
    .get('/user/orders', userInfoController.getOrders)
    .get('/user/courses', userInfoController.getCourse)
    .get('/user/collects', userInfoController.getCollectCourse)
    .get('/user/interactive', userInfoController.getInteractive)
    .post('/user/readMessage', userInfoController.readMessage);

module.exports = routers;
