const config = {
    port: 3031,
    secret_key: 'secret_key_123',
    database: {
        DATABASE: 'study_163',
        USERNAME: 'root',
        PASSWORD: '123456',
        PORT: '3306',
        HOST: 'localhost',
    },
    oss: {
        REGION: 'oss-cn-beijing',
        ACCESSKEYID: 'LTAI5tLVWFLf8FcAuTiZdA1Y',
        ACCESSKEYSECRET: 'dAycSk0cob8HokzjUQRDofZMZ9o5sK',
        BUCKET: 'study-163',
    },
};

module.exports = config;
