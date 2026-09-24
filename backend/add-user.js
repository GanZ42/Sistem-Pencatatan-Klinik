// Script untuk menambah / update akun user login.
// Cara pakai (dari folder backend):
//   node add-user.js <username> <password> "<Nama Lengkap>"
//
// Contoh:
//   node add-user.js gan gan12345 "Gan"

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function addUser() {
  const [username, password, namaLengkap] = process.argv.slice(2);

  if (!username || !password) {
    console.log('Cara pakai: node add-user.js <username> <password> "<Nama Lengkap>"');
    console.log('Contoh    : node add-user.js gan gan12345 "Gan"');
    process.exit(1);
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);

    if (rows.length > 0) {
      await pool.query(
        'UPDATE users SET password = ?, nama_lengkap = ? WHERE username = ?',
        [hash, namaLengkap || username, username]
      );
      console.log(`Username "${username}" sudah ada, password & nama berhasil diperbarui.`);
    } else {
      await pool.query(
        'INSERT INTO users (username, password, nama_lengkap) VALUES (?, ?, ?)',
        [username, hash, namaLengkap || username]
      );
      console.log(`Akun baru "${username}" berhasil dibuat.`);
    }

    console.log('----------------------------------');
    console.log('Username :', username);
    console.log('Password :', password);
    console.log('----------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('Gagal menambah user:', err.message);
    process.exit(1);
  }
}

addUser();
