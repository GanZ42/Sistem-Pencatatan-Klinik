function buildPulsePath(unitWidth, units, baseline) {
  let d = `M0,${baseline}`;
  for (let i = 0; i < units; i++) {
    const x = i * unitWidth;
    d += ` L${x + 18},${baseline}`;
    d += ` L${x + 26},${baseline - 8}`;
    d += ` L${x + 34},${baseline}`;
    d += ` L${x + 56},${baseline}`;
    d += ` L${x + 64},${baseline + 26}`;
    d += ` L${x + 72},${baseline - 34}`;
    d += ` L${x + 80},${baseline}`;
    d += ` L${x + 108},${baseline}`;
    d += ` L${x + 118},${baseline - 10}`;
    d += ` L${x + 128},${baseline}`;
    d += ` L${x + unitWidth},${baseline}`;
  }
  return d;
}

const PULSE_PATH = buildPulsePath(160, 5, 40);

const FEATURES = [
  {
    title: 'Cari pasien dalam hitungan detik',
    desc: 'Ketik nama atau No RM, langsung ketemu identitas dan seluruh riwayat kunjungannya.',
  },
  {
    title: 'Riwayat tersusun per tanggal',
    desc: 'Setiap kunjungan tercatat dengan pemeriksaan sendiri — tanggal 20 berbeda datanya dengan tanggal 19.',
  },
];

export default function LandingPage({ onMasuk }) {
  return (
    <div style={styles.page}>
      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.brandMark}>
          <div style={styles.crossIcon}>
            <div style={styles.crossV} />
            <div style={styles.crossH} />
          </div>
          <span style={styles.brandText}>Klinik Sehat</span>
        </div>
        <button style={styles.navBtn} onClick={onMasuk}>Masuk</button>
      </nav>

      {/* HERO */}
      <header style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={{ ...styles.eyebrow, animation: 'heroFadeUp 0.6s ease-out both' }}>
            Sistem pencatatan klinik
          </div>
          <h1 style={{ ...styles.headline, animation: 'heroFadeUp 0.6s ease-out 0.1s both' }}>
            Rekam medis pasien,<br />rapi dalam satu tempat.
          </h1>
          <p style={{ ...styles.heroSub, animation: 'heroFadeUp 0.6s ease-out 0.2s both' }}>
            Catat identitas, pemeriksaan, dan riwayat kunjungan pasien per tanggal —
            cepat dicari, mudah diperbarui, tanpa kertas berserakan.
          </p>

          <svg
            viewBox="0 0 800 80"
            style={{ ...styles.pulseSvg, animation: 'heroFadeUp 0.6s ease-out 0.3s both' }}
            preserveAspectRatio="none"
          >
            <path
              d={PULSE_PATH}
              fill="none"
              stroke="#E4572E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="240 240"
              style={{ animation: 'pulseDraw 2.4s linear infinite' }}
            />
          </svg>

          <div style={{ ...styles.heroActions, animation: 'heroFadeUp 0.6s ease-out 0.4s both' }}>
            <button style={styles.ctaBtn} onClick={onMasuk}>Masuk ke sistem →</button>
          </div>
        </div>
      </header>

      {/* FEATURES */}
      <section style={styles.features}>
        <div style={styles.featuresInner}>
          {FEATURES.map((f) => (
            <div key={f.title} style={styles.featureCard}>
              <div style={styles.featureBar} />
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={styles.finalCta}>
        <h2 style={styles.finalCtaTitle}>Siap dipakai hari ini.</h2>
        <p style={styles.finalCtaSub}>Masuk dengan akun petugas Anda untuk mulai mencatat kunjungan.</p>
        <button style={styles.ctaBtnLight} onClick={onMasuk}>Masuk ke sistem →</button>
      </section>

      <footer style={styles.footer}>
        © {new Date().getFullYear()} Klinik Sehat — Sistem internal pencatatan rekam medis.
      </footer>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#F5F7F5', color: 'var(--color-text)' },

  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '22px 40px', position: 'relative', zIndex: 2, background: '#0A3B35',
  },
  brandMark: { display: 'flex', alignItems: 'center', gap: '10px' },
  crossIcon: { position: 'relative', width: '24px', height: '24px' },
  crossV: {
    position: 'absolute', left: '10px', top: '1px', width: '4px', height: '22px',
    background: '#fff', borderRadius: '2px',
  },
  crossH: {
    position: 'absolute', top: '10px', left: '1px', width: '22px', height: '4px',
    background: '#fff', borderRadius: '2px',
  },
  brandText: {
    fontFamily: 'var(--font-landing)', fontWeight: 600, fontSize: '17px', color: '#fff',
  },
  navBtn: {
    padding: '9px 20px', borderRadius: '8px', border: '1.5px solid rgba(255,255,255,0.3)',
    background: 'transparent', color: '#fff', fontWeight: 600, fontSize: '14px',
  },

  hero: {
    background: 'linear-gradient(180deg, #0A3B35 0%, #0F4D46 100%)',
    padding: '0 40px',
  },
  heroInner: {
    maxWidth: '760px', margin: '0 auto', padding: '80px 0 70px', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  eyebrow: {
    fontFamily: 'var(--font-mono)', fontSize: '12.5px', letterSpacing: '0.12em',
    textTransform: 'uppercase', color: '#8FD9C7', marginBottom: '18px',
  },
  headline: {
    fontFamily: 'var(--font-landing)', fontWeight: 600, fontSize: '46px',
    lineHeight: 1.18, color: '#fff', margin: 0, letterSpacing: '-0.01em',
  },
  heroSub: {
    fontSize: '17px', lineHeight: 1.6, color: 'rgba(255,255,255,0.72)',
    maxWidth: '480px', marginTop: '20px',
  },
  pulseSvg: { width: '100%', maxWidth: '620px', height: '56px', marginTop: '28px' },
  heroActions: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '8px',
  },
  ctaBtn: {
    padding: '14px 30px', borderRadius: '10px', border: 'none',
    background: '#E4572E', color: '#fff', fontWeight: 700, fontSize: '15.5px',
    fontFamily: 'var(--font-landing)', boxShadow: '0 8px 20px rgba(228,87,46,0.35)',
  },
  ctaHint: { fontSize: '12.5px', color: 'rgba(255,255,255,0.5)' },

  features: { padding: '90px 40px', background: '#F5F7F5' },
  featuresInner: {
    maxWidth: '1080px', margin: '0 auto', display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px',
  },
  featureCard: {
    background: '#fff', borderRadius: '14px', padding: '30px 26px',
    border: '1px solid #E2E8E5',
  },
  featureBar: { width: '30px', height: '3px', background: '#E4572E', marginBottom: '18px' },
  featureTitle: {
    fontFamily: 'var(--font-landing)', fontSize: '17px', fontWeight: 600,
    marginBottom: '10px', lineHeight: 1.35, color: '#0A3B35',
  },
  featureDesc: { fontSize: '14.5px', lineHeight: 1.6, color: '#5C716C' },

  finalCta: {
    background: '#0A3B35', padding: '80px 40px', textAlign: 'center',
  },
  finalCtaTitle: {
    fontFamily: 'var(--font-landing)', fontWeight: 600, fontSize: '30px', color: '#fff', margin: 0,
  },
  finalCtaSub: {
    fontSize: '15px', color: 'rgba(255,255,255,0.65)', marginTop: '10px', marginBottom: '30px',
  },
  ctaBtnLight: {
    padding: '14px 30px', borderRadius: '10px', border: 'none',
    background: '#fff', color: '#0A3B35', fontWeight: 700, fontSize: '15.5px',
    fontFamily: 'var(--font-landing)',
  },

  footer: {
    padding: '22px 40px', textAlign: 'center', fontSize: '12.5px',
    color: '#8B9C97', background: '#0A3B35',
  },
};
