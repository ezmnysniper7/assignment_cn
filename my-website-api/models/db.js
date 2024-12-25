// models/db.js
const mysql = require('mysql2/promise');

// Create a connection pool (recommended for larger apps)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',      // your MySQL username
  password: 'mysql12345',  // your MySQL password (or whatever you set)
  database: 'my_website_db',  // the database name you will create
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
