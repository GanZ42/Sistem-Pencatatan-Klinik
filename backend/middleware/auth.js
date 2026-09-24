const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET belum di-set di file .env backend.');
    return res.status(500).json({ message: 'Konfigurasi server belum lengkap (JWT_SECRET).' });
  }
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Anda belum login. Silakan login terlebih dahulu.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Sesi login sudah tidak valid. Silakan login ulang.' });
  }
}

module.exports = authMiddleware;
