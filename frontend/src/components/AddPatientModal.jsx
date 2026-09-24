import { useState } from 'react';

const emptyForm = {
  no_rm: '', nama: '', jenis_kelamin: '', tanggal_lahir: '', nik: '', alamat: '',
  nama_kepala_keluarga: '', jenis_kunjungan: ''
};

const JENIS_KUNJUNGAN_OPTIONS = ['Persalinan', 'Ibu Hamil', 'Anak/KN', 'KB', 'Nifas/KF', 'Umum'];

export default function AddPatientModal({ onClose, onSubmit, saving, errorMessage }) {
  const [form, setForm] = useState(emptyForm);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.no_rm.trim() || !form.nama.trim()) return;
    onSubmit(form);
  }

  return (
    <div style={styles.overlay} onMouseDown={onClose}>
      <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>Tambah Identitas Pasien</h3>
          <button style={styles.closeBtn} onClick={onClose} type="button">✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <Field label="No RM (Rekam Medik)" required>
            <input style={styles.input} value={form.no_rm} onChange={(e) => update('no_rm', e.target.value)} placeholder="mis. RM-0003" />
          </Field>

          <Field label="Nama" required>
            <input style={styles.input} value={form.nama} onChange={(e) => update('nama', e.target.value)} placeholder="Nama lengkap pasien" />
          </Field>

          <Field label="Jenis Kelamin">
            <div style={styles.radioGroup}>
              {['Laki-Laki', 'Perempuan'].map((opt) => (
                <label key={opt} style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="jenis_kelamin"
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

          <div style={styles.row2}>
            <Field label="Tanggal Lahir">
              <input style={styles.input} type="date" value={form.tanggal_lahir} onChange={(e) => update('tanggal_lahir', e.target.value)} />
            </Field>
            <Field label="NIK">
              <input style={styles.input} value={form.nik} onChange={(e) => update('nik', e.target.value)} placeholder="16 digit NIK" />
            </Field>
          </div>

          <Field label="Alamat">
            <textarea style={{ ...styles.input, minHeight: '64px', resize: 'vertical' }} value={form.alamat} onChange={(e) => update('alamat', e.target.value)} placeholder="Alamat lengkap" />
          </Field>

          <Field label="Nama Kepala Keluarga">
            <input style={styles.input} value={form.nama_kepala_keluarga} onChange={(e) => update('nama_kepala_keluarga', e.target.value)} placeholder="Nama kepala keluarga" />
          </Field>

          <Field label="Jenis Kunjungan">
            <select
              style={styles.input}
              value={form.jenis_kunjungan}
              onChange={(e) => update('jenis_kunjungan', e.target.value)}
            >
              <option value="">-- Pilih jenis kunjungan --</option>
              {JENIS_KUNJUNGAN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </Field>

          {errorMessage && <div style={styles.errorBox}>{errorMessage}</div>}

          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>Batal</button>
            <button type="submit" style={styles.submitBtn} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Tambah Pasien'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>
        {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(16, 41, 38, 0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px',
  },
  modal: {
    background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', width: '100%',
    maxWidth: '520px', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 24px', borderBottom: '1px solid var(--color-border)',
  },
  title: { fontSize: '18px', fontWeight: 700 },
  closeBtn: {
    border: 'none', background: '#f2f9f7', width: '30px', height: '30px', borderRadius: '8px',
    fontSize: '14px', color: 'var(--color-text-muted)',
  },
  form: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  label: { fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' },
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
  errorBox: {
    background: 'var(--color-danger-bg)', color: 'var(--color-danger)', fontSize: '13px',
    padding: '10px 12px', borderRadius: 'var(--radius-sm)',
  },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' },
  cancelBtn: {
    padding: '10px 18px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-border)',
    background: '#fff', fontWeight: 600, fontSize: '14px', color: 'var(--color-text)',
  },
  submitBtn: {
    padding: '10px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
    background: 'var(--color-primary)', color: '#fff', fontWeight: 700, fontSize: '14px',
  },
};
