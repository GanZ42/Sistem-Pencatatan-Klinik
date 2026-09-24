require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const pasienRoutes = require('./routes/pasien');
const kunjunganRoutes = require('./routes/kunjungan');

const app = express();

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET belum di-set di file .env backend. Server dihentikan.');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Klinik API berjalan dengan baik.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/pasien', pasienRoutes);
app.use('/api/kunjungan', kunjunganRoutes);

// Handler untuk route yang tidak ditemukan
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Klinik API berjalan di http://localhost:${PORT}`);
});
