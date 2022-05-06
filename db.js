const mysql = require('promise-mysql2');
var pool = mysql.createPool({
    host:'localhost',
    user:'rewoke',
    database:'rewoke',
    password : 'rewoke'
});

module.exports = pool;