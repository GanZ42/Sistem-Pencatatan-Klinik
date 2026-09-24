import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../api';
import CalendarPicker from '../components/CalendarPicker.jsx';
import SearchBar from '../components/SearchBar.jsx';
import PatientTabs from '../components/PatientTabs.jsx';
import PatientHistoryTable from '../components/PatientHistoryTable.jsx';
import PatientForm from '../components/PatientForm.jsx';
import AddPatientModal from '../components/AddPatientModal.jsx';

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function Dashboard({ user, onLogout }) {
  const [tanggal, setTanggal] = useState(todayKey());
  const [kunjunganList, setKunjunganList] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [markedDates, setMarkedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Mode "riwayat" -> aktif setelah pasien dipilih lewat pencarian
  const [viewMode, setViewMode] = useState('date'); // 'date' | 'riwayat'
  const [riwayatPasien, setRiwayatPasien] = useState(null);
  const [riwayatList, setRiwayatList] = useState([]);
  const [riwayatLoading, setRiwayatLoading] = useState(false);
  const [addingBaru, setAddingBaru] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadKunjungan = useCallback(async (tgl) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/kunjungan', { params: { tanggal: tgl } });
      setKunjunganList(res.data);
      setActiveId(null);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal memuat data kunjungan.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMarkedDates = useCallback(async () => {
    try {
      const res = await api.get('/kunjungan/dates');
      setMarkedDates(res.data);
    } catch (err) {
      // diamkan saja, ini hanya untuk penanda titik di kalender
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'date') {
      loadKunjungan(tanggal);
    }
  }, [tanggal, viewMode, loadKunjungan]);

  useEffect(() => {
    loadMarkedDates();
  }, [loadMarkedDates]);

  // Pindah tanggal lewat kalender -> otomatis keluar dari mode riwayat
  function handleDateChange(newDate) {
    setViewMode('date');
    setRiwayatPasien(null);
    setRiwayatList([]);
    setActiveId(null);
    setTanggal(newDate);
  }

  async function handleSaveKunjungan(formData) {
    setSaving(true);
    setSavedFlash(false);
    setErrorMsg('');
    try {
      const res = await api.put(`/kunjungan/${formData.id}`, formData);
      setKunjunganList((list) => list.map((k) => (k.id === res.data.id ? res.data : k)));
      setRiwayatList((list) => list.map((k) => (k.id === res.data.id ? res.data : k)));
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan data.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddPatient(pasienForm) {
    setModalSaving(true);
    setModalError('');
    try {
      const res = await api.post('/kunjungan', {
        pasien_baru: pasienForm,
        tanggal_kunjungan: tanggal,
      });
      setKunjunganList((list) => [...list, res.data]);
      setActiveId(res.data.id);
      setModalOpen(false);
      loadMarkedDates();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Gagal menambahkan pasien.');
    } finally {
      setModalSaving(false);
    }
  }

  // Fungsi bersama: masuk ke mode Riwayat untuk satu pasien, opsional langsung buka salah satu tanggal
  const enterRiwayatMode = useCallback(async (pasienBasic, initialActiveId = null) => {
    setErrorMsg('');
    setViewMode('riwayat');
    setRiwayatPasien(pasienBasic);
    setActiveId(initialActiveId);
    setRiwayatLoading(true);
    try {
      const res = await api.get(`/kunjungan/riwayat/${pasienBasic.id}`);
      setRiwayatList(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengambil riwayat kunjungan pasien.');
    } finally {
      setRiwayatLoading(false);
    }
  }, []);

  // Pasien dipilih dari hasil pencarian -> masuk ke mode Riwayat (tampilkan tabel riwayat dulu)
  function handleSelectFromSearch(pasien) {
    enterRiwayatMode(pasien, null);
  }

  // Klik salah satu "Riwayat Tanggal" di bagian bawah form -> langsung buka data di tanggal itu
  function handleJumpToDate(kunjunganId) {
    if (!activeKunjungan) return;
    const pasienBasic = { id: activeKunjungan.pasien_id, nama: activeKunjungan.nama, no_rm: activeKunjungan.no_rm };
    enterRiwayatMode(pasienBasic, kunjunganId);
  }

  // Tombol "Tambah Kunjungan Baru" di halaman Riwayat -> buat kunjungan baru untuk pasien yang sama,
  // di tanggal yang dipilih pengguna (default hari ini)
  async function handleTambahKunjunganBaru(tanggalPilihan) {
    if (!riwayatPasien) return;
    setAddingBaru(true);
    setErrorMsg('');
    try {
      const res = await api.post('/kunjungan', {
        pasien_id: riwayatPasien.id,
        tanggal_kunjungan: tanggalPilihan || todayKey(),
      });
      setRiwayatList((list) => {
        const next = [...list, res.data];
        next.sort((a, b) => (a.tanggal_kunjungan < b.tanggal_kunjungan ? 1 : -1));
        return next;
      });
      setActiveId(res.data.id);
      loadMarkedDates();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal membuat kunjungan baru.');
    } finally {
      setAddingBaru(false);
    }
  }

  function handleBackFromRiwayat() {
    setViewMode('date');
    setRiwayatPasien(null);
    setRiwayatList([]);
    setActiveId(null);
    loadKunjungan(tanggal);
  }

  // Hapus satu data kunjungan (dipakai di tabel tanggal & tabel riwayat)
  async function handleDeleteKunjungan(kunjunganId) {
    setDeletingId(kunjunganId);
    setErrorMsg('');
    try {
      await api.delete(`/kunjungan/${kunjunganId}`);
      setKunjunganList((list) => list.filter((k) => k.id !== kunjunganId));
      setRiwayatList((list) => list.filter((k) => k.id !== kunjunganId));
      if (activeId === kunjunganId) setActiveId(null);
      loadMarkedDates();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menghapus data kunjungan.');
    } finally {
      setDeletingId(null);
    }
  }

  const activeKunjungan = viewMode === 'riwayat'
    ? riwayatList.find((k) => k.id === activeId) || null
    : kunjunganList.find((k) => k.id === activeId) || null;

  return (
    <div style={styles.page}>
      <header style={styles.topbar}>
        <div style={styles.brand}>Klinik Sehat</div>
        <div style={styles.userBox}>
          <div style={styles.avatar}>{(user?.nama_lengkap || user?.username || '?')[0].toUpperCase()}</div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.nama_lengkap || user?.username}</div>
            <button style={styles.logoutBtn} onClick={onLogout}>Keluar</button>
          </div>
        </div>
      </header>

      <div style={styles.bodyRow}>
        <aside style={styles.sidebar}>
          <CalendarPicker
            selectedDate={tanggal}
            onSelectDate={handleDateChange}
            markedDates={markedDates}
          />
          <SearchBar onSelectPatient={handleSelectFromSearch} />
          <button style={styles.sidebarAddBtn} onClick={() => setModalOpen(true)}>
            <span style={styles.plus}>+</span> Tambah Identitas Pasien
          </button>
        </aside>

        <main style={styles.main}>
          {errorMsg && <div style={styles.errorBanner}>{errorMsg}</div>}

          {/* ===== MODE RIWAYAT ===== */}
          {viewMode === 'riwayat' && !activeKunjungan && (
            <>
              {riwayatLoading && <div style={styles.loadingText}>Memuat riwayat...</div>}
              {!riwayatLoading && (
                <PatientHistoryTable
                  pasien={riwayatPasien}
                  riwayatList={riwayatList}
                  activeId={activeId}
                  onSelect={setActiveId}
                  onTambahKunjungan={handleTambahKunjunganBaru}
                  onBack={handleBackFromRiwayat}
                  addingBaru={addingBaru}
                  onDelete={handleDeleteKunjungan}
                  deletingId={deletingId}
                />
              )}
            </>
          )}

          {/* ===== MODE TANGGAL (default) ===== */}
          {viewMode === 'date' && !loading && !activeKunjungan && (
            <>
              <PatientTabs
                kunjunganList={kunjunganList}
                activeId={activeId}
                onSelect={(id) => setActiveId((prev) => (prev === id ? null : id))}
                onDelete={handleDeleteKunjungan}
                deletingId={deletingId}
              />

              {kunjunganList.length === 0 && (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>🗓️</div>
                  <h3 style={styles.emptyTitle}>Belum ada pasien pada tanggal ini</h3>
                  <p style={styles.emptyText}>
                    Pilih tanggal lain, atau tekan "Tambah Identitas Pasien" di samping untuk mencatat kunjungan baru.
                  </p>
                </div>
              )}
            </>
          )}

          {viewMode === 'date' && loading && <div style={styles.loadingText}>Memuat data...</div>}

          {/* ===== FORM PASIEN (dipakai di kedua mode) ===== */}
          {activeKunjungan && (
            <div style={styles.formNarrow}>
              <button
                style={styles.backBtn}
                onClick={() => setActiveId(null)}
              >
                {viewMode === 'riwayat' ? '‹ Kembali ke Riwayat Kunjungan' : '‹ Kembali ke Identitas Pasien'}
              </button>

              <PatientForm
                key={activeKunjungan.id}
                kunjungan={activeKunjungan}
                onSave={handleSaveKunjungan}
                saving={saving}
                savedFlash={savedFlash}
                onJumpToDate={handleJumpToDate}
              />
            </div>
          )}
        </main>
      </div>

      {modalOpen && (
        <AddPatientModal
          onClose={() => { setModalOpen(false); setModalError(''); }}
          onSubmit={handleAddPatient}
          saving={modalSaving}
          errorMessage={modalError}
        />
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' },
  topbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 32px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)',
    flexShrink: 0,
  },
  brand: {
    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '17px', color: 'var(--color-primary-dark)',
  },
  bodyRow: { display: 'flex', flex: 1, alignItems: 'flex-start' },
  sidebar: {
    width: '300px', flexShrink: 0, background: 'var(--color-surface)',
    borderRight: '1px solid var(--color-border)', padding: '28px 24px',
    display: 'flex', flexDirection: 'column', gap: '24px',
    minHeight: 'calc(100vh - 65px)',
  },
  sidebarAddBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px 16px',
    borderRadius: 'var(--radius-sm)', border: '1.5px dashed var(--color-primary)', background: '#eef7f5',
    color: 'var(--color-primary)', fontWeight: 700, fontSize: '14px', width: '100%',
  },
  plus: { fontSize: '16px', fontWeight: 800 },
  userBox: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: {
    width: '38px', height: '38px', borderRadius: '50%', background: 'var(--color-primary)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontFamily: 'var(--font-display)',
  },
  userInfo: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  userName: { fontWeight: 700, fontSize: '14px' },
  logoutBtn: {
    border: 'none', background: 'none', color: 'var(--color-text-muted)', fontSize: '12.5px',
    padding: 0, textDecoration: 'underline', cursor: 'pointer',
  },
  main: { flex: 1, padding: '28px 40px 60px', minWidth: 0 },
  errorBanner: {
    background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '12px 16px',
    borderRadius: 'var(--radius-sm)', fontSize: '14px', marginBottom: '16px',
  },
  loadingText: { color: 'var(--color-text-muted)', padding: '20px 0' },
  emptyState: {
    textAlign: 'center', padding: '60px 20px', background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)', marginTop: '20px',
  },
  emptyIcon: { fontSize: '32px', marginBottom: '8px' },
  emptyTitle: { fontSize: '17px', marginBottom: '6px' },
  emptyText: { color: 'var(--color-text-muted)', fontSize: '14px', maxWidth: '360px', margin: '0 auto' },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px',
    padding: '9px 16px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-border)',
    background: 'var(--color-surface)', color: 'var(--color-primary-dark)', fontWeight: 700, fontSize: '14px',
    boxShadow: 'var(--shadow-sm)',
  },
  formNarrow: { maxWidth: '900px', margin: '0 auto' },
};
