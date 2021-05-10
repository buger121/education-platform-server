const Router = require('koa-router');

const router = new Router();

const home = require('./home');
const api = require('./api');
const course = require('./course');

router.use('/api', api.routes(), api.allowedMethods());
router.use('/home', home.routes(), home.allowedMethods());
router.use('/course', course.routes(), course.allowedMethods());

module.exports = router;
