# Sistem Pencatatan Klinik

Aplikasi pencatatan pasien & kunjungan klinik (Laragon + MySQL + Express + React).

Link github: `https://github.com/GanZ42/Sistem-Pencatatan-Klinik.git`

## TECH STACK (detail sesuai project)

**Database:**
- MySQL `Ver 8.4.3 for Win64 on x86_64` (kompatibel MySQL 8 / MariaDB 10.6+)
- Database `klinik_db`, Engine InnoDB, `utf8mb4 / utf8mb4_unicode_ci`
- Tabel: `users, pasien, kunjungan` (`kunjungan.pasien_id -> pasien.id ON DELETE CASCADE`)

**Backend (`/backend`):**
- Runtime Node.js `v24.20.0`, npm `11.19.0`, CommonJS, port `5000`
- `express@4.22.2` - REST API + routing
- `mysql2@3.23.1` - pool promise (limit 10, `dateStrings: true`)
- `jsonwebtoken@9.0.3` - auth Bearer JWT expired 8 jam
- `bcryptjs@2.4.3` - hash password
- `cors@2.8.6`, `dotenv@16.6.1`
- dev: `nodemon@3.1.14`

**Frontend (`/frontend`):**
- `react@18.3.1`, `react-dom@18.3.1` (SPA, StrictMode, tanpa router)
- `vite@5.4.21`, `@vitejs/plugin-react@4.7.0` - dev port `5173`, proxy `/api -> http://localhost:5000`
- `axios@1.18.1` - client `src/api.js` + interceptor `klinik_token`
- `jspdf@4.2.1` - cetak PDF

## Fitur
- Landing page, login JWT (`localStorage klinik_token + klinik_user`)
- Dashboard per-tanggal + CalendarPicker + penanda tanggal ada kunjungan
- CRUD pasien (validasi No RM unik, NIK 16 digit, jenis kelamin Laki-Laki/Perempuan)
- CRUD kunjungan (transaksi, jenis: Persalinan, Ibu Hamil, Anak/KN, KB, Nifas/KF, Umum)
- Pemeriksaan fisik: BB, TB, IMT auto-hitung, TD format 120/80, nadi, suhu, anamnesa, asesment, planning
- Search pasien, riwayat per-pasien, tab pasien, hapus kunjungan, cetak PDF

## Struktur
```
klinik-app/
  backend/
    server.js        # entry, /api/health, /api/auth, /api/pasien, /api/kunjungan
    db.js            # mysql pool Laragon
    routes/auth.js | pasien.js | kunjungan.js
    middleware/auth.js
    schema.sql | migrasi_jenis.sql | seed.js | add-user.js
  frontend/
    src/App.jsx | main.jsx | api.js
    src/pages/LandingPage.jsx | Login.jsx | Dashboard.jsx
    src/components/AddPatientModal.jsx | CalendarPicker.jsx | PatientForm.jsx | PatientHistoryTable.jsx | PatientTabs.jsx | SearchBar.jsx
    src/utils/generatePdf.js
```

## Cara jalan (Laragon)

1. Nyalakan Laragon (MySQL port 3306), buat DB via phpMyAdmin atau:
```sql
mysql -u root < backend/schema.sql
```

2. Backend:
```bash
cd backend
npm install
copy .env.example .env
# edit JWT_SECRET, DB_NAME=klinik_db
npm run seed   # buat admin / admin123
npm run dev    # http://localhost:5000
```

`.env`:
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=klinik_db
JWT_SECRET=ganti_dengan_kalimat_rahasia_anda_sendiri
PORT=5000
```

3. Frontend:
```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
npm run build  # hasil di dist/
```

Akun default: `admin / admin123`

## API
| Method | Endpoint | Auth | Ket |
|---|---|---|---|
| GET | /api/health | - | cek server |
| POST | /api/auth/login | - | {username,password} -> {token,user} |
| GET | /api/pasien?q= | Bearer | search max 50 |
| POST | /api/pasien | Bearer | tambah pasien |
| PUT | /api/pasien/:id | Bearer | edit pasien |
| GET | /api/kunjungan?tanggal=YYYY-MM-DD | Bearer | list per tanggal |
| GET | /api/kunjungan/dates | Bearer | tanggal ada data |
| POST | /api/kunjungan | Bearer | {pasien_id / pasien_baru, tanggal_kunjungan} |
| PUT | /api/kunjungan/:id | Bearer | simpan pemeriksaan |
| GET | /api/kunjungan/riwayat/:pasienId | Bearer | riwayat pasien |
| DELETE | /api/kunjungan/:id | Bearer | hapus |
