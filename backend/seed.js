// Skrip ini membuat akun admin default dengan password ter-hash yang benar.
// Jalankan dengan: npm run seed  (dari dalam folder backend)

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function seed() {
  try {
    const username = 'admin';
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);

    const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);

    if (rows.length > 0) {
      await pool.query('UPDATE users SET password = ? WHERE username = ?', [hash, username]);
      console.log('Akun admin sudah ada, password direset ulang.');
    } else {
      await pool.query(
        'INSERT INTO users (username, password, nama_lengkap) VALUES (?, ?, ?)',
        [username, hash, 'Administrator Klinik']
      );
      console.log('Akun admin berhasil dibuat.');
    }

    console.log('----------------------------------');
    console.log('Username : admin');
    console.log('Password : admin123');
    console.log('----------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('Gagal membuat akun admin:', err.message);
    process.exit(1);
  }
}

seed();
