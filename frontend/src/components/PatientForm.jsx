import { useEffect, useState } from 'react';
import api from '../api';

const JENIS_KUNJUNGAN_OPTIONS = ['Persalinan', 'Ibu Hamil', 'Anak/KN', 'KB', 'Nifas/KF', 'Umum'];

function hitungIMT(bb, tb) {
  const beratNum = parseFloat(bb);
  const tinggiNum = parseFloat(tb);
  if (!beratNum || !tinggiNum) return '';
  const tinggiM = tinggiNum / 100;
  const imt = beratNum / (tinggiM * tinggiM);
  return imt.toFixed(2);
}

function parseTanggalLokal(tgl) {
  if (!tgl) return null;
  const s = String(tgl).slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return new Date(tgl);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function formatTanggalSingkat(tgl) {
  if (!tgl) return '-';
  try {
    const d = parseTanggalLokal(tgl);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return tgl;
  }
}

export default function PatientForm({ kunjungan, onSave, saving, savedFlash, onJumpToDate }) {
  const [form, setForm] = useState(kunjungan);
  const [riwayatTanggal, setRiwayatTanggal] = useState([]);
  const [riwayatLoading, setRiwayatLoading] = useState(false);

  useEffect(() => {
    setForm(kunjungan);
  }, [kunjungan]);

  useEffect(() => {
    if (!kunjungan?.pasien_id) {
      setRiwayatTanggal([]);
      return;
    }
    let cancelled = false;
    setRiwayatLoading(true);
    api.get(`/kunjungan/riwayat/${kunjungan.pasien_id}`)
      .then((res) => { if (!cancelled) setRiwayatTanggal(res.data); })
      .catch(() => { if (!cancelled) setRiwayatTanggal([]); })
      .finally(() => { if (!cancelled) setRiwayatLoading(false); });
    return () => { cancelled = true; };
  }, [kunjungan?.pasien_id]);

  function update(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === 'bb' || field === 'tb') {
        next.imt = hitungIMT(next.bb, next.tb);
      }
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  if (!form) return null;

  return (
    <div>
      <form onSubmit={handleSubmit} style={styles.container}>
        {/* IDENTITAS PASIEN */}
        <Section title="Identitas Pasien">
          <div style={styles.grid2}>
            <Field label="No RM (Rekam Medik)">
              <input style={styles.input} value={form.no_rm || ''} onChange={(e) => update('no_rm', e.target.value)} />
            </Field>
            <Field label="Nama">
              <input style={styles.input} value={form.nama || ''} onChange={(e) => update('nama', e.target.value)} />
            </Field>
            <Field label="Jenis Kelamin">
              <div style={styles.radioGroup}>
                {['Laki-Laki', 'Perempuan'].map((opt) => (
                  <label key={opt} style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="jenis_kelamin_edit"
                      value={opt}
                      checked={form.jenis_kelamin === opt}
                      onChange={(e) => update('jenis_kelamin', e.target.value)}
                      style={styles.radioInput}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Tanggal Lahir">
              <input style={styles.input} type="date" value={form.tanggal_lahir || ''} onChange={(e) => update('tanggal_lahir', e.target.value)} />
            </Field>
            <Field label="NIK">
              <input style={styles.input} value={form.nik || ''} onChange={(e) => update('nik', e.target.value)} />
            </Field>
            <Field label="Nama Kepala Keluarga">
              <input style={styles.input} value={form.nama_kepala_keluarga || ''} onChange={(e) => update('nama_kepala_keluarga', e.target.value)} />
            </Field>
            <Field label="Alamat" span2>
              <textarea style={{ ...styles.input, minHeight: '60px', resize: 'vertical' }} value={form.alamat || ''} onChange={(e) => update('alamat', e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* JENIS KUNJUNGAN */}
        <Section title="Jenis Kunjungan">
          <Field label="Jenis Kunjungan">
            <select
              style={styles.input}
              value={form.jenis_kunjungan || ''}
              onChange={(e) => update('jenis_kunjungan', e.target.value)}
            >
              <option value="">-- Pilih jenis kunjungan --</option>
              {JENIS_KUNJUNGAN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </Field>
        </Section>

        {/* ANAMNESA & ALERGI */}
        <Section title="Anamnesa">
          <Field label="Anamnesa">
            <textarea style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }} value={form.anamnesa || ''} onChange={(e) => update('anamnesa', e.target.value)} placeholder="Keluhan dan riwayat penyakit sekarang..." />
          </Field>
          <Field label="Riwayat Alergi">
            <textarea style={{ ...styles.input, minHeight: '60px', resize: 'vertical' }} value={form.riwayat_alergi || ''} onChange={(e) => update('riwayat_alergi', e.target.value)} placeholder="Contoh: Alergi obat, makanan, dll." />
          </Field>
        </Section>

        {/* PEMERIKSAAN FISIK */}
        <Section title="Pemeriksaan Fisik">
          <div style={styles.grid3}>
            <Field label="BB (kg)">
              <input style={styles.input} type="number" step="0.1" value={form.bb || ''} onChange={(e) => update('bb', e.target.value)} />
            </Field>
            <Field label="TB (cm)">
              <input style={styles.input} type="number" step="0.1" value={form.tb || ''} onChange={(e) => update('tb', e.target.value)} />
            </Field>
            <Field label="IMT">
              <input style={styles.input} value={form.imt || ''} onChange={(e) => update('imt', e.target.value)} placeholder="Otomatis dari BB & TB" />
            </Field>
            <Field label="TD (Tekanan Darah)">
              <input style={styles.input} value={form.td || ''} onChange={(e) => update('td', e.target.value)} placeholder="mis. 120/80" />
            </Field>
            <Field label="Nadi (x/menit)">
              <input style={styles.input} value={form.nadi || ''} onChange={(e) => update('nadi', e.target.value)} />
            </Field>
            <Field label="Suhu (°C)">
              <input style={styles.input} value={form.suhu || ''} onChange={(e) => update('suhu', e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* ASSESMENT & PLANNING */}
        <Section title="Assesment & Planning">
          <Field label="Assesment">
            <textarea style={{ ...styles.input, minHeight: '70px', resize: 'vertical' }} value={form.asesment || ''} onChange={(e) => update('asesment', e.target.value)} placeholder="Diagnosis / kesimpulan pemeriksaan..." />
          </Field>
          <Field label="Planning">
            <textarea style={{ ...styles.input, minHeight: '70px', resize: 'vertical' }} value={form.planning || ''} onChange={(e) => update('planning', e.target.value)} placeholder="Rencana terapi / tindak lanjut..." />
          </Field>
        </Section>

        <div style={styles.footer}>
          {savedFlash && <span style={styles.savedFlash}>✓ Perubahan tersimpan</span>}
          <button type="submit" style={styles.saveBtn} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>

      {/* RIWAYAT TANGGAL */}
      {kunjungan?.pasien_id && (
        <div style={styles.riwayatCard}>
          <h3 style={styles.riwayatTitle}>Riwayat Tanggal Kunjungan</h3>

          {riwayatLoading && <div style={styles.riwayatHint}>Memuat riwayat...</div>}

          {!riwayatLoading && riwayatTanggal.length === 0 && (
            <div style={styles.riwayatHint}>Belum ada riwayat kunjungan lain untuk pasien ini.</div>
          )}

          {!riwayatLoading && riwayatTanggal.length > 0 && (
            <div style={styles.riwayatList}>
              {riwayatTanggal.map((k) => {
                const isActive = k.id === kunjungan.id;
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => !isActive && onJumpToDate && onJumpToDate(k.id)}
                    style={{
                      ...styles.riwayatPill,
                      ...(isActive ? styles.riwayatPillActive : {}),
                    }}
                  >
                    {formatTanggalSingkat(k.tanggal_kunjungan)}
                    {k.jenis_kunjungan && (
                      <span style={styles.riwayatPillSub}> • {k.jenis_kunjungan}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}

function Field({ label, children, span2 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: span2 ? 'span 2' : undefined }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  container: {
    background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)',
    padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '28px',
  },
  section: { display: 'flex', flexDirection: 'column', gap: '14px' },
  sectionTitle: {
    fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-dark)',
    paddingBottom: '8px', borderBottom: '2px solid #eef7f5',
  },
  sectionBody: { display: 'flex', flexDirection: 'column', gap: '14px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' },
  label: { fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-muted)' },
  input: {
    padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-border)',
    fontSize: '14px', background: '#fbfefd', color: 'var(--color-text)', width: '100%',
  },
  radioGroup: { display: 'flex', gap: '18px', paddingTop: '2px' },
  radioLabel: {
    display: 'flex', alignItems: 'center', gap: '7px', fontSize: '14px',
    color: 'var(--color-text)', fontWeight: 500, cursor: 'pointer',
  },
  radioInput: { width: '16px', height: '16px', accentColor: 'var(--color-primary)', cursor: 'pointer' },
  footer: {
    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px',
    borderTop: '1px solid var(--color-border)', paddingTop: '20px',
  },
  savedFlash: { color: 'var(--color-primary)', fontWeight: 600, fontSize: '13px' },
  saveBtn: {
    padding: '12px 28px', borderRadius: 'var(--radius-sm)', border: 'none',
    background: 'var(--color-primary)', color: '#fff', fontWeight: 700, fontSize: '15px',
    boxShadow: '0 4px 12px rgba(15,118,110,0.25)',
  },
  riwayatCard: {
    marginTop: '20px', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', padding: '22px 28px',
  },
  riwayatTitle: {
    fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-dark)',
    marginBottom: '14px', paddingBottom: '8px', borderBottom: '2px solid #eef7f5',
  },
  riwayatHint: { fontSize: '13.5px', color: 'var(--color-text-muted)' },
  riwayatList: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  riwayatPill: {
    padding: '9px 16px', borderRadius: '10px', border: '1.5px solid var(--color-border)',
    background: '#fbfefd', color: 'var(--color-text)', fontWeight: 600, fontSize: '13.5px',
    whiteSpace: 'nowrap',
  },
  riwayatPillActive: {
    background: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: '#fff',
    cursor: 'default',
  },
  riwayatPillSub: { fontWeight: 500, opacity: 0.85 },
};
