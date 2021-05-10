const OSS = require('ali-oss');
const config = require('./../../config');

const store = new OSS({
    accessKeyId: config.oss.ACCESSKEYID,
    accessKeySecret: config.oss.ACCESSKEYSECRET,
    bucket: config.oss.BUCKET,
    region: config.oss.REGION,
});

module.exports = store;
