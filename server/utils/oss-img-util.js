const oss = require('ali-oss');
const config = require('./../../config');

const imgClient = oss.ImageClient({
    accessKeyId: config.oss.ACCESSKEYID,
    accessKeySecret: config.oss.ACCESSKEYSECRET,
    bucket: config.oss.BUCKET,
    //   imageHost: 'thumbnail.myimageservice.com'
});
