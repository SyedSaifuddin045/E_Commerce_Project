require("dotenv").config();
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DATABASE_NAME,
  password: process.env.DB_PASSWORD,
});

module.exports = connection.promise();