const Koa = require('koa');
const bodyParser = require('koa-body');
const path = require('path');
const session = require('koa-session-minimal');
const MysqlStore = require('koa-mysql-session');
const cors = require('koa2-cors');
const koaStatic = require('koa-static');
const jsonwebtoken = require('jsonwebtoken');
const jwt = require('koa-jwt');
const history = require('connect-history-api-fallback');

const config = require('./../config');
const routers = require('./routers/index');
const ossStore = require('./utils/oss-utils');

const app = new Koa();

// ossStore.putBucketACL('study-163', 'public-read-write').then((result) => {
//     ossStore.getBucketACL('study-163').then((result) => {
//         console.log(result.acl);
//     });
// });

// app.use(history());

//session存储配置
const sessionMysqlConfig = {
    user: config.database.USERNAME,
    password: config.database.PASSWORD,
    database: config.database.DATABASE,
    port: config.database.PORT,
};
//配置session中间件
app.use(
    session({
        key: 'USER_SID',
        store: new MysqlStore(sessionMysqlConfig),
    })
);
//配置ctx.body中间件
app.use(
    bodyParser({
        multipart: true,
        formidable: {
            uploadDir: path.join(__dirname, '/public/uploads'),
            keepExtensions: true,
        },
    })
);
//开启静态文件访问
app.use(koaStatic(path.resolve(__dirname, './public')));

//开启cors跨域
app.use(
    cors({
        origin: function (ctx) {
            if (ctx.url === '/test') {
                return false;
            }
            return '*';
        },
        exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
        maxAge: 5,
        credentials: true,
        allowMethods: ['GET', 'POST', 'DELETE'],
        allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
    })
);

app.use(routers.routes());
app.use(routers.allowedMethods());

app.listen(config.port);
console.log(`server start at ${config.port}...`);
