-- =====================================================
-- MIGRASI: Tambah kolom Jenis Kelamin & Jenis Kunjungan
-- Jalankan file ini di database yang SUDAH ADA (tidak perlu install ulang).
-- Cara pakai (dari folder backend, lewat terminal):
--   mysql -u root klinik_db < migrasi_jenis.sql
-- =====================================================

USE klinik_db;

-- Jenis Kelamin -> disimpan di tabel pasien (identitas dasar pasien)
ALTER TABLE pasien
  ADD COLUMN jenis_kelamin ENUM('Laki-Laki', 'Perempuan') DEFAULT NULL AFTER nama;

-- Jenis Kunjungan -> disimpan di tabel kunjungan (bisa beda tiap kali pasien datang)
ALTER TABLE kunjungan
  ADD COLUMN jenis_kunjungan ENUM('Persalinan', 'Ibu Hamil', 'Anak/KN', 'KB', 'Nifas/KF', 'Umum') DEFAULT NULL AFTER tanggal_kunjungan;
