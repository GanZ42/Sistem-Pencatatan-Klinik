const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

const JENIS_KELAMIN_OK = ['Laki-Laki', 'Perempuan'];
const JENIS_KUNJUNGAN_OK = ['Persalinan', 'Ibu Hamil', 'Anak/KN', 'KB', 'Nifas/KF', 'Umum'];

function cekAngka(nilai, min, maks) {
  if (nilai === null || nilai === undefined || nilai === '') return null; // kosong = boleh (disimpan NULL)
  const n = Number(nilai);
  if (!Number.isFinite(n)) return 'harus berupa angka.';
  if (n < min || n > maks) return `harus antara ${min} sampai ${maks}.`;
  return null;
}

function validasiKunjungan({ jenis_kelamin, jenis_kunjungan, nik, bb, tb, imt, td }) {
  if (jenis_kelamin && !JENIS_KELAMIN_OK.includes(jenis_kelamin)) return 'Jenis kelamin tidak valid.';
  if (jenis_kunjungan && !JENIS_KUNJUNGAN_OK.includes(jenis_kunjungan)) return 'Jenis kunjungan tidak valid.';
  if (nik && !/^\d{16}$/.test(String(nik).trim())) return 'NIK harus 16 digit angka.';
  const eBb = cekAngka(bb, 0, 300);
  if (eBb) return `BB ${eBb}`;
  const eTb = cekAngka(tb, 0, 250);
  if (eTb) return `TB ${eTb}`;
  const eImt = cekAngka(imt, 5, 100);
  if (eImt) return `IMT ${eImt}`;
  if (td && !/^\d{2,3}\/\d{2,3}$/.test(String(td).trim())) return 'TD harus format 120/80.';
  return null;
}

// GET /api/kunjungan?tanggal=YYYY-MM-DD -> semua kunjungan + identitas pasien pada tanggal itu
router.get('/', async (req, res) => {
  try {
    const { tanggal } = req.query;
    if (!tanggal) {
      return res.status(400).json({ message: 'Parameter tanggal wajib diisi.' });
    }

    const [rows] = await pool.query(
      `SELECT k.*, p.no_rm, p.nama, p.jenis_kelamin, p.tanggal_lahir, p.nik, p.alamat, p.nama_kepala_keluarga
       FROM kunjungan k
       JOIN pasien p ON p.id = k.pasien_id
       WHERE k.tanggal_kunjungan = ?
       ORDER BY k.id ASC`,
      [tanggal]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data kunjungan.' });
  }
});

// GET /api/kunjungan/dates -> daftar semua tanggal yang punya kunjungan (untuk penanda di kalender)
router.get('/dates', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT tanggal_kunjungan FROM kunjungan ORDER BY tanggal_kunjungan DESC`
    );
    res.json(rows.map(r => r.tanggal_kunjungan));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil daftar tanggal kunjungan.' });
  }
});

// POST /api/kunjungan -> buat kunjungan baru untuk pasien pada tanggal tertentu
// body: { pasien_id, tanggal_kunjungan }  (pasien harus sudah ada, atau kirim data pasien baru sekaligus)
router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      pasien_id, pasien_baru, tanggal_kunjungan, jenis_kunjungan
    } = req.body;

    if (!tanggal_kunjungan) {
      conn.release();
      return res.status(400).json({ message: 'Tanggal kunjungan wajib diisi.' });
    }

    let finalPasienId = pasien_id;

    await conn.beginTransaction();

    // Jika mengirim data pasien baru sekaligus (dari modal "Tambah Identitas Pasien")
    if (!finalPasienId && pasien_baru) {
      const { no_rm, nama, jenis_kelamin, tanggal_lahir, nik, alamat, nama_kepala_keluarga, jenis_kunjungan: jkBaru } = pasien_baru;

      if (!no_rm || !nama) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ message: 'No RM dan Nama pasien wajib diisi.' });
      }

      const errBaru = validasiKunjungan({ jenis_kelamin, jenis_kunjungan: jkBaru || jenis_kunjungan, nik });
      if (errBaru) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ message: errBaru });
      }

      const [existing] = await conn.query('SELECT id FROM pasien WHERE no_rm = ?', [no_rm]);
      if (existing.length > 0) {
        await conn.rollback();
        conn.release();
        return res.status(409).json({ message: 'No RM sudah terdaftar. Gunakan No RM lain.' });
      }

      const [result] = await conn.query(
        `INSERT INTO pasien (no_rm, nama, jenis_kelamin, tanggal_lahir, nik, alamat, nama_kepala_keluarga)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [no_rm, nama, jenis_kelamin || null, tanggal_lahir || null, nik || null, alamat || null, nama_kepala_keluarga || null]
      );
      finalPasienId = result.insertId;
    }

    if (!finalPasienId) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: 'Pasien wajib dipilih atau diisi datanya.' });
    }

    const [kunjunganResult] = await conn.query(
      `INSERT INTO kunjungan (pasien_id, tanggal_kunjungan, jenis_kunjungan) VALUES (?, ?, ?)`,
      [finalPasienId, tanggal_kunjungan, jenis_kunjungan || null]
    );

    await conn.commit();

    const [rows] = await pool.query(
      `SELECT k.*, p.no_rm, p.nama, p.jenis_kelamin, p.tanggal_lahir, p.nik, p.alamat, p.nama_kepala_keluarga
       FROM kunjungan k JOIN pasien p ON p.id = k.pasien_id WHERE k.id = ?`,
      [kunjunganResult.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Gagal membuat kunjungan baru.' });
  } finally {
    conn.release();
  }
});

// PUT /api/kunjungan/:id -> simpan perubahan identitas + pemeriksaan pasien pada kunjungan ini
router.put('/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const {
      // identitas pasien
      no_rm, nama, jenis_kelamin, tanggal_lahir, nik, alamat, nama_kepala_keluarga,
      // data kunjungan / pemeriksaan
      jenis_kunjungan, anamnesa, riwayat_alergi, bb, tb, imt, td, nadi, suhu, asesment, planning
    } = req.body;

    await conn.beginTransaction();

    const [kRows] = await conn.query('SELECT pasien_id FROM kunjungan WHERE id = ?', [id]);
    if (kRows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ message: 'Data kunjungan tidak ditemukan.' });
    }
    const pasienId = kRows[0].pasien_id;

    const errVal = validasiKunjungan({ no_rm, nama, jenis_kelamin, jenis_kunjungan, nik, bb, tb, imt, td });
    if (errVal) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: errVal });
    }

    if (no_rm && nama) {
      // Cegah No RM ganda milik pasien lain saat edit dari form kunjungan
      const [duplikat] = await conn.query('SELECT id FROM pasien WHERE no_rm = ? AND id != ?', [no_rm, pasienId]);
      if (duplikat.length > 0) {
        await conn.rollback();
        conn.release();
        return res.status(409).json({ message: 'No RM sudah dipakai pasien lain. Gunakan No RM lain.' });
      }
      await conn.query(
        `UPDATE pasien SET no_rm = ?, nama = ?, jenis_kelamin = ?, tanggal_lahir = ?, nik = ?, alamat = ?, nama_kepala_keluarga = ?
         WHERE id = ?`,
        [no_rm, nama, jenis_kelamin || null, tanggal_lahir || null, nik || null, alamat || null, nama_kepala_keluarga || null, pasienId]
      );
    }

    await conn.query(
      `UPDATE kunjungan SET
        jenis_kunjungan = ?, anamnesa = ?, riwayat_alergi = ?, bb = ?, tb = ?, imt = ?, td = ?, nadi = ?, suhu = ?,
        asesment = ?, planning = ?
       WHERE id = ?`,
      [
        jenis_kunjungan || null, anamnesa || null, riwayat_alergi || null,
        bb || null, tb || null, imt || null, td || null, nadi || null, suhu || null,
        asesment || null, planning || null,
        id
      ]
    );

    await conn.commit();

    const [rows] = await pool.query(
      `SELECT k.*, p.no_rm, p.nama, p.jenis_kelamin, p.tanggal_lahir, p.nik, p.alamat, p.nama_kepala_keluarga
       FROM kunjungan k JOIN pasien p ON p.id = k.pasien_id WHERE k.id = ?`,
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Gagal menyimpan data kunjungan.' });
  } finally {
    conn.release();
  }
});

// GET /api/kunjungan/riwayat/:pasienId -> semua kunjungan milik satu pasien (dipakai fitur pencarian)
router.get('/riwayat/:pasienId', async (req, res) => {
  try {
    const { pasienId } = req.params;
    const [rows] = await pool.query(
      `SELECT k.*, p.no_rm, p.nama, p.jenis_kelamin, p.tanggal_lahir, p.nik, p.alamat, p.nama_kepala_keluarga
       FROM kunjungan k JOIN pasien p ON p.id = k.pasien_id
       WHERE k.pasien_id = ?
       ORDER BY k.tanggal_kunjungan DESC, k.id DESC`,
      [pasienId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil riwayat kunjungan pasien.' });
  }
});

// DELETE /api/kunjungan/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM kunjungan WHERE id = ?', [id]);
    res.json({ message: 'Data kunjungan berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus data kunjungan.' });
  }
});

module.exports = router;
