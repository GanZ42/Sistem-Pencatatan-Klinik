import { useEffect, useState } from 'react';
import { generateKunjunganPdf } from '../utils/generatePdf.js';

const PAGE_SIZE = 10;

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
  const s = String(tgl).slice(0, 10); // ambil YYYY-MM-DD saja (abaikan jam jika ada)
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return new Date(tgl); // fallback untuk format lain
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function formatTanggal(tgl) {
  if (!tgl) return '-';
  try {
    const d = parseTanggalLokal(tgl);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return tgl;
  }
}

export default function PatientTabs({ kunjunganList, activeId, onSelect, onDelete, deletingId }) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(kunjunganList.length / PAGE_SIZE));

  useEffect(() => {
    setPage(0);
  }, [kunjunganList.length]);

  useEffect(() => {
    if (page > totalPages - 1) setPage(totalPages - 1);
  }, [totalPages, page]);

  const start = page * PAGE_SIZE;
  const visibleList = kunjunganList.slice(start, start + PAGE_SIZE);

  function goPrev() {
    setPage((p) => Math.max(0, p - 1));
  }
  function goNext() {
    setPage((p) => Math.min(totalPages - 1, p + 1));
  }

  function handleDeleteClick(e, k) {
    e.stopPropagation();
    if (window.confirm(`Hapus data kunjungan "${k.nama}" pada tanggal ini?\n\nTindakan ini tidak bisa dibatalkan.`)) {
      onDelete(k.id);
    }
  }

  function handlePdfClick(e, k) {
    e.stopPropagation();
    generateKunjunganPdf(k);
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerRow}>
        <h3 style={styles.title}>Identitas Pasien</h3>
      </div>

      {kunjunganList.length === 0 ? (
        <div style={styles.emptyHint}>Belum ada pasien pada tanggal ini.</div>
      ) : (
        <>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>No RM</th>
                  <th style={styles.th}>Nama</th>
                  <th style={styles.th}>Jenis Kelamin</th>
                  <th style={styles.th}>Jenis Kunjungan</th>
                  <th style={styles.th}>Tanggal Lahir</th>
                  <th style={styles.th}>NIK</th>
                  <th style={styles.th}>Alamat</th>
                  <th style={styles.th}>Nama Kepala Keluarga</th>
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
                      style={{
                        ...styles.tr,
                        ...(isActive ? styles.trActive : {}),
                      }}
                    >
                      <td style={{ ...styles.td, ...(isActive ? styles.tdActive : {}) }}>{k.no_rm}</td>
                      <td style={{ ...styles.td, ...styles.tdName, ...(isActive ? styles.tdActive : {}) }}>{k.nama}</td>
                      <td style={{ ...styles.td, ...(isActive ? styles.tdActive : {}) }}>{k.jenis_kelamin || '-'}</td>
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
                      <td style={{ ...styles.td, ...(isActive ? styles.tdActive : {}) }}>{formatTanggal(k.tanggal_lahir)}</td>
                      <td style={{ ...styles.td, ...(isActive ? styles.tdActive : {}) }}>{k.nik || '-'}</td>
                      <td style={{ ...styles.td, ...styles.tdAlamat, ...(isActive ? styles.tdActive : {}) }}>{k.alamat || '-'}</td>
                      <td style={{ ...styles.td, ...(isActive ? styles.tdActive : {}) }}>{k.nama_kepala_keluarga || '-'}</td>
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
              <button
                type="button"
                onClick={goPrev}
                disabled={page === 0}
                style={{ ...styles.navBtn, ...(page === 0 ? styles.navBtnDisabled : {}) }}
              >
                ‹ Sebelumnya
              </button>
              <span style={styles.pageIndicator}>Halaman {page + 1} / {totalPages}</span>
              <button
                type="button"
                onClick={goNext}
                disabled={page >= totalPages - 1}
                style={{ ...styles.navBtn, ...(page >= totalPages - 1 ? styles.navBtnDisabled : {}) }}
              >
                Berikutnya ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: '20px', marginBottom: '4px', background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
  },
  headerRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 22px', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '10px',
  },
  title: { fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark)' },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
    borderRadius: '10px', border: '1.5px dashed var(--color-primary)', background: '#eef7f5',
    color: 'var(--color-primary)', fontWeight: 700, fontSize: '13.5px', whiteSpace: 'nowrap',
  },
  plus: { fontSize: '15px', fontWeight: 800 },
  emptyHint: {
    fontSize: '13.5px', color: 'var(--color-text-muted)', padding: '28px', textAlign: 'center',
  },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' },
  th: {
    textAlign: 'left', padding: '12px 12px', background: '#f2f9f7', color: 'var(--color-text-muted)',
    fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em',
    whiteSpace: 'nowrap', borderBottom: '1px solid var(--color-border)',
  },
  tr: {
    cursor: 'pointer', borderBottom: '1px solid var(--color-border)', transition: 'background 0.1s',
  },
  trActive: {
    background: 'var(--color-primary)',
  },
  td: {
    padding: '12px 12px', color: 'var(--color-text)', whiteSpace: 'nowrap',
  },
  tdName: { fontWeight: 700, whiteSpace: 'nowrap' },
  tdAlamat: { whiteSpace: 'normal', minWidth: '220px' },
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
  navBtnDisabled: {
    opacity: 0.35, color: 'var(--color-text-muted)', cursor: 'default',
  },
  pageIndicator: { fontSize: '12.5px', color: 'var(--color-text-muted)', fontWeight: 600 },
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
};
