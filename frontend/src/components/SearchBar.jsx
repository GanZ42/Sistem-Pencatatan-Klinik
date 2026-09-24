import { useEffect, useRef, useState } from 'react';
import api from '../api';

export default function SearchBar({ onSelectPatient }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get('/pasien', { params: { q: query.trim() } });
        setResults(res.data);
        setOpen(true);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function handlePick(pasien) {
    setQuery('');
    setResults([]);
    setOpen(false);
    onSelectPatient(pasien);
  }

  return (
    <div style={styles.wrapper} ref={wrapperRef}>
      <div style={styles.labelSmall}>Cari Identitas Pasien</div>
      <div style={styles.inputBox}>
        <SearchGlyph />
        <input
          style={styles.input}
          type="text"
          placeholder="Ketik nama pasien atau No RM..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
        />
      </div>

      {open && (
        <div style={styles.dropdown}>
          {loading && <div style={styles.hint}>Mencari...</div>}

          {!loading && results.length === 0 && (
            <div style={styles.hint}>Pasien tidak ditemukan.</div>
          )}

          {!loading && results.map((p) => (
            <button
              key={p.id}
              type="button"
              style={styles.resultItem}
              onClick={() => handlePick(p)}
            >
              <div style={styles.resultName}>{p.nama}</div>
              <div style={styles.resultSub}>
                No RM: {p.no_rm}{p.nik ? ` • NIK: ${p.nik}` : ''}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="#5c7772" strokeWidth="2"/>
      <path d="M21 21L16.65 16.65" stroke="#5c7772" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

const styles = {
  wrapper: { position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' },
  labelSmall: {
    fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  inputBox: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)', padding: '10px 14px', boxShadow: 'var(--shadow-sm)',
  },
  input: {
    border: 'none', outline: 'none', fontSize: '14px', width: '100%',
    background: 'transparent', color: 'var(--color-text)',
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 60,
    background: 'var(--color-surface)', borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)',
    maxHeight: '280px', overflowY: 'auto', padding: '6px',
  },
  hint: { padding: '12px', fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center' },
  resultItem: {
    display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px',
    border: 'none', background: 'transparent', borderRadius: '8px', cursor: 'pointer',
  },
  resultName: { fontWeight: 700, fontSize: '14px', color: 'var(--color-text)' },
  resultSub: { fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' },
};
