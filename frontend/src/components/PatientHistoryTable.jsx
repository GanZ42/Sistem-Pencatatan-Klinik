import { useState } from 'react';
import { generateKunjunganPdf } from '../utils/generatePdf.js';

const PAGE_SIZE = 5;

const JENIS_BADGE_COLOR = {
  'Persalinan': '#be185d',
  'Ibu Hamil': '#7c3aed',
  'Anak/KN': '#0284c7',
  'KB': '#ca8a04',
  'Nifas/KF': '#059669',
  'Umum': '#5c7772',
};

function parseTanggalLokal(tgl) {
  if (!tgl) return null;
  const s = String(tgl).slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return new Date(tgl);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function formatTanggal(tgl) {
  if (!tgl) return '-';
  try {
    const d = parseTanggalLokal(tgl);
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return tgl;
  }
}

function ringkas(text, max = 60) {
  if (!text) return '-';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function PatientHistoryTable({ pasien, riwayatList, activeId, onSelect, onTambahKunjungan, onBack, addingBaru, onDelete, deletingId }) {
  const [page, setPage] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [newDate, setNewDate] = useState(todayKey());

  const totalPages = Math.max(1, Math.ceil(riwayatList.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const visibleList = riwayatList.slice(start, start + PAGE_SIZE);

  function goPrev() { setPage((p) => Math.max(0, p - 1)); }
  function goNext() { setPage((p) => Math.min(totalPages - 1, p + 1)); }

  function handleDeleteClick(e, k) {
    e.stopPropagation();
    const label = formatTanggal(k.tanggal_kunjungan);
    if (window.confirm(`Hapus data kunjungan tanggal ${label}?\n\nTindakan ini tidak bisa dibatalkan.`)) {
      onDelete(k.id);
    }
  }

  function handlePdfClick(e, k) {
    e.stopPropagation();
    generateKunjunganPdf(k);
  }

  function handleOpenPicker() {
    setNewDate(todayKey());
    setPickerOpen(true);
  }

  function handleConfirmTambah() {
    onTambahKunjungan(newDate);
    setPickerOpen(false);
  }

  return (
    <div style={styles.wrapper}>
      <button type="button" style={styles.backBtn} onClick={onBack}>
        ‹ Kembali ke Tanggal Kunjungan
      </button>

      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div>
            <div style={styles.eyebrow}>Riwayat Kunjungan</div>
            <h3 style={styles.title}>{pasien?.nama}</h3>
            <div style={styles.subInfo}>No RM: {pasien?.no_rm}</div>
          </div>
        </div>

        {riwayatList.length === 0 ? (
          <div style={styles.emptyHint}>Belum ada riwayat kunjungan untuk pasien ini.</div>
        ) : (
          <>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Tanggal Kunjungan</th>
                    <th style={styles.th}>Jenis Kunjungan</th>
                    <th style={styles.th}>Assesment</th>
                    <th style={styles.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleList.map((k) => {
                    const isActive = k.id === activeId;
                    const isDeleting = deletingId === k.id;
                    const badgeColor = JENIS_BADGE_COLOR[k.jenis_kunjungan] || '#5c7772';
                    return (
                      <tr
                        key={k.id}
                        onClick={() => onSelect(k.id)}
                        style={{ ...styles.tr, ...(isActive ? styles.trActive : {}) }}
                      >
                        <td style={{ ...styles.td, ...styles.tdName, ...(isActive ? styles.tdActive : {}) }}>
                          {formatTanggal(k.tanggal_kunjungan)}
                        </td>
                        <td style={styles.td}>
                          {k.jenis_kunjungan ? (
                            <span style={{
                              ...styles.badge,
                              background: isActive ? 'rgba(255,255,255,0.2)' : `${badgeColor}1a`,
                              color: isActive ? '#fff' : badgeColor,
                            }}>
                              {k.jenis_kunjungan}
                            </span>
                          ) : (
                            <span style={{ ...(isActive ? styles.tdActive : {}) }}>-</span>
                          )}
                        </td>
                        <td style={{ ...styles.td, ...(isActive ? styles.tdActive : {}) }}>
                          {ringkas(k.asesment)}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            type="button"
                            onClick={(e) => handlePdfClick(e, k)}
                            style={{
                              ...styles.pdfBtn,
                              ...(isActive ? styles.pdfBtnOnActive : {}),
                            }}
                            title="Unduh PDF kunjungan ini"
                          >
                            PDF
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteClick(e, k)}
                            disabled={isDeleting}
                            style={{
                              ...styles.deleteBtn,
                              ...(isActive ? styles.deleteBtnOnActive : {}),
                            }}
                            title="Hapus data kunjungan ini"
                          >
                            {isDeleting ? '...' : '🗑'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button type="button" onClick={goPrev} disabled={page === 0}
                  style={{ ...styles.navBtn, ...(page === 0 ? styles.navBtnDisabled : {}) }}>
                  ‹ Sebelumnya
                </button>
                <span style={styles.pageIndicator}>Halaman {page + 1} / {totalPages}</span>
                <button type="button" onClick={goNext} disabled={page >= totalPages - 1}
                  style={{ ...styles.navBtn, ...(page >= totalPages - 1 ? styles.navBtnDisabled : {}) }}>
                  Berikutnya ›
                </button>
              </div>
            )}
          </>
        )}

        <div style={styles.footer}>
          {!pickerOpen ? (
            <button type="button" style={styles.tambahBtn} onClick={handleOpenPicker} disabled={addingBaru}>
              <span style={styles.plus}>+</span> {addingBaru ? 'Menyiapkan...' : 'Tambah Kunjungan Baru'}
            </button>
          ) : (
            <div style={styles.datePickerPanel}>
              <label style={styles.datePickerLabel}>Tanggal kunjungan baru</label>
              <div style={styles.datePickerRow}>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  style={styles.dateInput}
                />
                <button type="button" style={styles.confirmBtn} onClick={handleConfirmTambah} disabled={addingBaru || !newDate}>
                  {addingBaru ? 'Menyiapkan...' : 'Tambah'}
                </button>
                <button type="button" style={styles.cancelBtn} onClick={() => setPickerOpen(false)} disabled={addingBaru}>
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { marginTop: '20px' },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px',
    padding: '9px 16px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-border)',
    background: 'var(--color-surface)', color: 'var(--color-primary-dark)', fontWeight: 700, fontSize: '14px',
    boxShadow: 'var(--shadow-sm)',
  },
  card: {
    background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
  },
  headerRow: { padding: '20px 22px', borderBottom: '1px solid var(--color-border)' },
  eyebrow: {
    fontSize: '11.5px', fontWeight: 700, color: 'var(--color-text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px',
  },
  title: { fontSize: '19px', fontWeight: 800 },
  subInfo: { fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' },
  emptyHint: { fontSize: '13.5px', color: 'var(--color-text-muted)', padding: '28px', textAlign: 'center' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' },
  th: {
    textAlign: 'left', padding: '12px 16px', background: '#f2f9f7', color: 'var(--color-text-muted)',
    fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em',
    whiteSpace: 'nowrap', borderBottom: '1px solid var(--color-border)',
  },
  tr: { cursor: 'pointer', borderBottom: '1px solid var(--color-border)' },
  trActive: { background: 'var(--color-primary)' },
  td: { padding: '12px 16px', color: 'var(--color-text)' },
  tdName: { fontWeight: 700, whiteSpace: 'nowrap' },
  tdActive: { color: '#fff' },
  badge: {
    display: 'inline-block', padding: '4px 10px', borderRadius: '999px',
    fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap',
  },
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
    padding: '14px', borderTop: '1px solid var(--color-border)', background: '#fbfefd',
  },
  navBtn: {
    padding: '7px 14px', borderRadius: '8px', border: '1.5px solid var(--color-border)',
    background: 'var(--color-surface)', color: 'var(--color-primary)', fontWeight: 700, fontSize: '13px',
  },
  navBtnDisabled: { opacity: 0.35, color: 'var(--color-text-muted)', cursor: 'default' },
  pageIndicator: { fontSize: '12.5px', color: 'var(--color-text-muted)', fontWeight: 600 },
  footer: { padding: '16px 22px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'center' },
  tambahBtn: {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '11px 22px',
    borderRadius: '10px', border: '1.5px dashed var(--color-primary)', background: '#eef7f5',
    color: 'var(--color-primary)', fontWeight: 700, fontSize: '14px',
  },
  plus: { fontSize: '15px', fontWeight: 800 },
  deleteBtn: {
    border: '1.5px solid var(--color-border)', background: 'var(--color-surface)',
    color: 'var(--color-danger)', width: '30px', height: '30px', borderRadius: '8px',
    fontSize: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  },
  deleteBtnOnActive: {
    border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)', color: '#fff',
  },
  pdfBtn: {
    border: '1.5px solid var(--color-border)', background: 'var(--color-surface)',
    color: 'var(--color-primary-dark)', height: '30px', padding: '0 10px', borderRadius: '8px',
    fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.02em',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px',
  },
  pdfBtnOnActive: {
    border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)', color: '#fff',
  },
  datePickerPanel: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
  },
  datePickerLabel: {
    fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.04em',
  },
  datePickerRow: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' },
  dateInput: {
    padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-border)',
    fontSize: '14px', background: '#fbfefd', color: 'var(--color-text)',
  },
  confirmBtn: {
    padding: '9px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
    background: 'var(--color-primary)', color: '#fff', fontWeight: 700, fontSize: '14px',
  },
  cancelBtn: {
    padding: '9px 16px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-border)',
    background: '#fff', color: 'var(--color-text)', fontWeight: 600, fontSize: '14px',
  },
};
