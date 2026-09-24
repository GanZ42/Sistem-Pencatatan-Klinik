const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const user = rows[0];
    const cocok = await bcrypt.compare(password, user.password);

    if (!cocok) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('FATAL: JWT_SECRET belum di-set di file .env backend.');
      return res.status(500).json({ message: 'Konfigurasi server belum lengkap.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, nama_lengkap: user.nama_lengkap },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, nama_lengkap: user.nama_lengkap }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

module.exports = router;
