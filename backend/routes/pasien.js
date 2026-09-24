const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

const JENIS_KELAMIN_OK = ['Laki-Laki', 'Perempuan'];

function validasiPasien({ no_rm, nama, jenis_kelamin, nik }) {
  if (!no_rm || !nama) return 'No RM dan Nama wajib diisi.';
  if (jenis_kelamin && !JENIS_KELAMIN_OK.includes(jenis_kelamin)) {
    return 'Jenis kelamin tidak valid.';
  }
  if (nik && !/^\d{16}$/.test(String(nik).trim())) {
    return 'NIK harus 16 digit angka.';
  }
  return null;
}

// GET /api/pasien -> daftar semua pasien (untuk pencarian saat tambah kunjungan)
router.get('/', async (req, res) => {
  try {
    const q = req.query.q ? `%${req.query.q}%` : '%';
    const [rows] = await pool.query(
      'SELECT * FROM pasien WHERE nama LIKE ? OR no_rm LIKE ? OR nik LIKE ? ORDER BY nama ASC LIMIT 50',
      [q, q, q]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data pasien.' });
  }
});

// POST /api/pasien -> tambah pasien baru
router.post('/', async (req, res) => {
  try {
    const { no_rm, nama, jenis_kelamin, tanggal_lahir, nik, alamat, nama_kepala_keluarga } = req.body;

    const errVal = validasiPasien({ no_rm, nama, jenis_kelamin, nik });
    if (errVal) {
      return res.status(400).json({ message: errVal });
    }

    const [existing] = await pool.query('SELECT id FROM pasien WHERE no_rm = ?', [no_rm]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'No RM sudah terdaftar. Gunakan No RM lain.' });
    }

    const [result] = await pool.query(
      `INSERT INTO pasien (no_rm, nama, jenis_kelamin, tanggal_lahir, nik, alamat, nama_kepala_keluarga)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [no_rm, nama, jenis_kelamin || null, tanggal_lahir || null, nik || null, alamat || null, nama_kepala_keluarga || null]
    );

    const [rows] = await pool.query('SELECT * FROM pasien WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menambahkan pasien.' });
  }
});

// PUT /api/pasien/:id -> update identitas pasien
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { no_rm, nama, jenis_kelamin, tanggal_lahir, nik, alamat, nama_kepala_keluarga } = req.body;

    const errVal = validasiPasien({ no_rm, nama, jenis_kelamin, nik });
    if (errVal) {
      return res.status(400).json({ message: errVal });
    }

    // Cegah duplikat No RM milik pasien lain (kasus nyata: salah ketik RM saat edit)
    const [duplikat] = await pool.query('SELECT id FROM pasien WHERE no_rm = ? AND id != ?', [no_rm, id]);
    if (duplikat.length > 0) {
      return res.status(409).json({ message: 'No RM sudah dipakai pasien lain. Gunakan No RM lain.' });
    }

    await pool.query(
      `UPDATE pasien SET no_rm = ?, nama = ?, jenis_kelamin = ?, tanggal_lahir = ?, nik = ?, alamat = ?, nama_kepala_keluarga = ?
       WHERE id = ?`,
      [no_rm, nama, jenis_kelamin || null, tanggal_lahir || null, nik || null, alamat || null, nama_kepala_keluarga || null, id]
    );

    const [rows] = await pool.query('SELECT * FROM pasien WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pasien tidak ditemukan.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui data pasien.' });
  }
});

module.exports = router;
