import { useState } from 'react';
import api from '../api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Username dan password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('klinik_token', res.data.token);
      localStorage.setItem('klinik_user', JSON.stringify(res.data.user));
      onLoginSuccess(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.panelLeft}>
        <div style={styles.brandMark}>
          <div style={styles.crossIcon}>
            <div style={styles.crossV} />
            <div style={styles.crossH} />
          </div>
          <span style={styles.brandText}>Klinik Sehat</span>
        </div>
        <h1 style={styles.leftHeadline}>Rekam medis pasien,<br />rapi dalam satu tempat.</h1>
        <p style={styles.leftSub}>
          Catat identitas, pemeriksaan, dan riwayat kunjungan pasien per tanggal — cepat dicari, mudah diperbarui.
        </p>
      </div>

      <div style={styles.panelRight}>
        <form onSubmit={handleSubmit} style={styles.card}>
          <h2 style={styles.title}>Masuk ke akun Anda</h2>
          <p style={styles.subtitle}>Gunakan username dan password petugas klinik.</p>

          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="mis. admin"
            autoFocus
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password"
          />

          {error && <div style={styles.errorBox}>{error}</div>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
  },
  panelLeft: {
    flex: '1.1',
    background: 'linear-gradient(160deg, #0f766e 0%, #0a5750 100%)',
    color: '#fff',
    padding: '56px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '20px',
  },
  brandMark: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '32px',
  },
  crossIcon: {
    position: 'relative',
    width: '28px',
    height: '28px',
  },
  crossV: {
    position: 'absolute',
    left: '12px',
    top: '2px',
    width: '4px',
    height: '24px',
    background: '#fff',
    borderRadius: '2px',
  },
  crossH: {
    position: 'absolute',
    top: '12px',
    left: '2px',
    width: '24px',
    height: '4px',
    background: '#fff',
    borderRadius: '2px',
  },
  brandText: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '19px',
    letterSpacing: '0.2px',
  },
  leftHeadline: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: '40px',
    lineHeight: 1.15,
    maxWidth: '480px',
    color: '#ffffff',
  },
  leftSub: {
    fontSize: '19px',
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.9)',
    maxWidth: '460px',
  },
  panelRight: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    background: 'var(--color-bg)',
  },
  card: {
    width: '100%',
    maxWidth: '380px',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
    padding: '40px 36px',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
  },
  subtitle: {
    color: 'var(--color-text-muted)',
    fontSize: '14px',
    marginTop: '6px',
    marginBottom: '28px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: '6px',
    marginTop: '16px',
  },
  input: {
    padding: '12px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--color-border)',
    fontSize: '15px',
    background: '#fbfefd',
    color: 'var(--color-text)',
  },
  errorBox: {
    marginTop: '16px',
    background: 'var(--color-danger-bg)',
    color: 'var(--color-danger)',
    fontSize: '13px',
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
  },
  button: {
    marginTop: '26px',
    padding: '13px',
    background: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 700,
    fontSize: '15px',
    transition: 'background 0.15s',
  },
};
