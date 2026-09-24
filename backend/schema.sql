-- =====================================================
-- Database: klinik_db
-- Import file ini lewat phpMyAdmin (Laragon) atau:
-- mysql -u root -p < schema.sql
-- =====================================================

CREATE DATABASE IF NOT EXISTS klinik_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE klinik_db;

-- Tabel user untuk login
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL, -- disimpan dalam bentuk hash (bcrypt)
  nama_lengkap VARCHAR(150) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel data master pasien (identitas)
CREATE TABLE IF NOT EXISTS pasien (
  id INT AUTO_INCREMENT PRIMARY KEY,
  no_rm VARCHAR(30) NOT NULL UNIQUE,        -- No Rekam Medik
  nama VARCHAR(150) NOT NULL,
  jenis_kelamin ENUM('Laki-Laki', 'Perempuan') DEFAULT NULL,
  tanggal_lahir DATE DEFAULT NULL,
  nik VARCHAR(20) DEFAULT NULL,
  alamat TEXT DEFAULT NULL,
  nama_kepala_keluarga VARCHAR(150) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel kunjungan: satu pasien bisa datang di beberapa tanggal berbeda,
-- setiap kunjungan punya data pemeriksaan sendiri.
CREATE TABLE IF NOT EXISTS kunjungan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pasien_id INT NOT NULL,
  tanggal_kunjungan DATE NOT NULL,
  jenis_kunjungan ENUM('Persalinan', 'Ibu Hamil', 'Anak/KN', 'KB', 'Nifas/KF', 'Umum') DEFAULT NULL,

  anamnesa TEXT DEFAULT NULL,
  riwayat_alergi TEXT DEFAULT NULL,

  -- Pemeriksaan Fisik
  bb DECIMAL(5,2) DEFAULT NULL,     -- Berat Badan (kg)
  tb DECIMAL(5,2) DEFAULT NULL,     -- Tinggi Badan (cm)
  imt DECIMAL(5,2) DEFAULT NULL,    -- Indeks Massa Tubuh (auto hitung di FE, disimpan juga)
  td VARCHAR(20) DEFAULT NULL,      -- Tekanan Darah, contoh: 120/80
  nadi VARCHAR(20) DEFAULT NULL,    -- x/menit
  suhu VARCHAR(20) DEFAULT NULL,    -- Celcius

  asesment TEXT DEFAULT NULL,
  planning TEXT DEFAULT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (pasien_id) REFERENCES pasien(id) ON DELETE CASCADE,
  INDEX idx_tanggal (tanggal_kunjungan)
);

-- =====================================================
-- Data awal (contoh) supaya langsung bisa dicoba
-- =====================================================

-- Catatan: akun admin default (username: admin, password: admin123) dibuat
-- otomatis lewat perintah "npm run seed" di folder backend (lihat README).
-- Ini supaya hash password bcrypt-nya benar-benar valid.

-- Contoh pasien A & B untuk mengetes fitur ganti tanggal
INSERT INTO pasien (no_rm, nama, tanggal_lahir, nik, alamat, nama_kepala_keluarga) VALUES
('RM-0001', 'Pasien A - Siti Aminah', '1990-05-12', '1271010101900001', 'Jl. Melati No. 10, Padangsidempuan', 'Ahmad Yani'),
('RM-0002', 'Pasien B - Budi Santoso', '1985-11-02', '1271010101850002', 'Jl. Kenanga No. 5, Padangsidempuan', 'Budi Santoso')
ON DUPLICATE KEY UPDATE nama = nama;

-- Kunjungan contoh: Pasien A di hari ini, Pasien B di kemarin
INSERT INTO kunjungan (pasien_id, tanggal_kunjungan, anamnesa, riwayat_alergi, bb, tb, imt, td, nadi, suhu, asesment, planning)
VALUES
(1, CURDATE(), 'Demam sejak 2 hari, batuk ringan', 'Tidak ada', 55.00, 160.00, 21.48, '110/70', '82', '37.5', 'Observasi febris', 'Paracetamol 3x500mg, kontrol 3 hari'),
(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Nyeri kepala, pusing berputar', 'Alergi seafood', 70.00, 168.00, 24.80, '130/85', '76', '36.8', 'Vertigo ringan', 'Betahistine 2x1, istirahat cukup');
