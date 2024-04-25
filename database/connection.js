const mysql = require('mysql');

const connection = mysql.createConnection({
    host: '47.100.101.113',
    user: 'message-borad',
    password: 'n5Cmwa7XEzFb7pf6',
    database: 'message-borad'
});

connection.connect();

module.exports = connection;
