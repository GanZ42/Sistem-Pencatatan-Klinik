require('dotenv').config();
const mysql = require('mysql2/promise');

// Pool koneksi ke MySQL milik Laragon
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'klinik_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true // supaya kolom DATE dikembalikan sebagai string "YYYY-MM-DD", bukan objek Date UTC
});

module.exports = pool;
