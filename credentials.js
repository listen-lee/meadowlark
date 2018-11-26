module.exports = {
    cookieSecret: "123456",
    mongo: {
        development: {
            connectionString: 'mongodb://mongo:qwer1234@ds117334.mlab.com:17334/meadowlark'
        },
        production: {
            connectionString: ''
        }
    }
};