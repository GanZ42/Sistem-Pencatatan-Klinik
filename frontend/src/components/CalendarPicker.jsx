import { useEffect, useRef, useState } from 'react';

const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function toDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseTanggalLokal(tgl) {
  if (!tgl) return new Date();
  const s = String(tgl).slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return new Date(tgl);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export default function CalendarPicker({ selectedDate, onSelectDate, markedDates = [] }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseTanggalLokal(selectedDate));
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setViewDate(parseTanggalLokal(selectedDate));
  }, [selectedDate]);

  const markedSet = new Set(markedDates);
  const selected = parseTanggalLokal(selectedDate);

  const displayLabel = selected.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function changeMonth(delta) {
    setViewDate(new Date(year, month + delta, 1));
  }

  function pickDay(day) {
    const picked = new Date(year, month, day);
    onSelectDate(toDateKey(picked));
    setOpen(false);
  }

  function goToday() {
    const today = new Date();
    onSelectDate(toDateKey(today));
    setOpen(false);
  }

  return (
    <div style={styles.wrapper} ref={ref}>
      <div style={styles.labelSmall}>Tanggal Kunjungan</div>
      <button style={styles.trigger} onClick={() => setOpen((o) => !o)}>
        <CalendarGlyph />
        <span style={styles.triggerText}>{displayLabel}</span>
        <ChevronGlyph open={open} />
      </button>

      {open && (
        <div style={styles.popover}>
          <div style={styles.popoverHeader}>
            <button type="button" style={styles.navBtn} onClick={() => changeMonth(-1)}>‹</button>
            <div style={styles.monthLabel}>{BULAN[month]} {year}</div>
            <button type="button" style={styles.navBtn} onClick={() => changeMonth(1)}>›</button>
          </div>

          <div style={styles.weekRow}>
            {HARI.map((h) => (
              <div key={h} style={styles.weekCell}>{h}</div>
            ))}
          </div>

          <div style={styles.grid}>
            {cells.map((day, idx) => {
              if (day === null) return <div key={idx} />;
              const cellDate = new Date(year, month, day);
              const key = toDateKey(cellDate);
              const isSelected = key === toDateKey(selected);
              const isMarked = markedSet.has(key);
              const isToday = key === toDateKey(new Date());

              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => pickDay(day)}
                  style={{
                    ...styles.dayCell,
                    ...(isSelected ? styles.dayCellSelected : {}),
                    ...(isToday && !isSelected ? styles.dayCellToday : {}),
                  }}
                >
                  {day}
                  {isMarked && !isSelected && <span style={styles.dot} />}
                </button>
              );
            })}
          </div>

          <button type="button" style={styles.todayBtn} onClick={goToday}>
            Ke hari ini
          </button>
        </div>
      )}
    </div>
  );
}

function CalendarGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="3" stroke="#0f766e" strokeWidth="1.8"/>
      <path d="M3 9.5H21" stroke="#0f766e" strokeWidth="1.8"/>
      <path d="M8 3V6.5" stroke="#0f766e" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M16 3V6.5" stroke="#0f766e" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function ChevronGlyph({ open }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
    >
      <path d="M6 9L12 15L18 9" stroke="#5c7772" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const styles = {
  wrapper: { position: 'relative', display: 'flex', width: '100%', flexDirection: 'column', gap: '6px' },
  labelSmall: {
    fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.06em'
  },
  trigger: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)', padding: '10px 14px',
    boxShadow: 'var(--shadow-sm)',
  },
  triggerText: {
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--color-text)',
    whiteSpace: 'nowrap',
  },
  popover: {
    position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 50,
    background: 'var(--color-surface)', borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)',
    padding: '16px', width: '280px',
  },
  popoverHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px',
  },
  navBtn: {
    border: 'none', background: '#eef7f5', borderRadius: '8px', width: '28px', height: '28px',
    fontSize: '16px', color: 'var(--color-primary)', fontWeight: 700,
  },
  monthLabel: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px' },
  weekRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' },
  weekCell: { textAlign: 'center', fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '4px' },
  dayCell: {
    position: 'relative', border: 'none', background: 'transparent', borderRadius: '8px',
    height: '32px', fontSize: '13px', color: 'var(--color-text)',
  },
  dayCellSelected: {
    background: 'var(--color-primary)', color: '#fff', fontWeight: 700,
  },
  dayCellToday: {
    border: '1.5px solid var(--color-primary-light)', fontWeight: 700,
  },
  dot: {
    position: 'absolute', bottom: '3px', left: '50%', transform: 'translateX(-50%)',
    width: '4px', height: '4px', borderRadius: '50%', background: 'var(--color-accent)',
  },
  todayBtn: {
    marginTop: '10px', width: '100%', padding: '8px', border: 'none',
    background: '#eef7f5', color: 'var(--color-primary)', fontWeight: 700,
    borderRadius: '8px', fontSize: '13px',
  },
};
