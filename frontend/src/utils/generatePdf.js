import { jsPDF } from 'jspdf';

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

function isi(val) {
  if (val === null || val === undefined) return '-';
  const s = String(val).trim();
  return s ? s : '-';
}

export function generateKunjunganPdf(k) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const marginX = 18;
  const pageWidth = 210;
  const pageHeight = 297;
  const contentWidth = pageWidth - marginX * 2;
  let y = 20;

  function checkPageBreak(estimatedHeight = 22) {
    if (y + estimatedHeight > pageHeight - 18) {
      doc.addPage();
      y = 20;
    }
  }

  function addSectionTitle(title) {
    checkPageBreak(16);
    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(15, 118, 110);
    doc.text(title, marginX, y);
    doc.setDrawColor(220, 234, 231);
    doc.setLineWidth(0.4);
    doc.line(marginX, y + 2.2, pageWidth - marginX, y + 2.2);
    y += 8.5;
  }

  function addField(label, value) {
    const text = isi(value);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    const lines = doc.splitTextToSize(text, contentWidth);
    checkPageBreak(lines.length * 5 + 9);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.7);
    doc.setTextColor(92, 113, 108);
    doc.text(label.toUpperCase(), marginX, y);
    y += 4.6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(22, 48, 44);
    doc.text(lines, marginX, y);
    y += lines.length * 5 + 4;
  }

  function addFieldRow(fields) {
    // fields: array of { label, value }, ditampilkan berdampingan dalam satu baris
    checkPageBreak(14);
    const colWidth = contentWidth / fields.length;
    fields.forEach((f, i) => {
      const x = marginX + i * colWidth;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.7);
      doc.setTextColor(92, 113, 108);
      doc.text(f.label.toUpperCase(), x, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(22, 48, 44);
      doc.text(isi(f.value), x, y + 4.6);
    });
    y += 13;
  }

  // ===== HEADER =====
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(15, 118, 110);
  doc.text('Klinik Sehat', marginX, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(92, 113, 108);
  doc.text('Rekam Medis Pasien', marginX, y + 6.5);

  doc.setFontSize(9);
  const cetakLabel = `Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`;
  doc.text(cetakLabel, pageWidth - marginX, y, { align: 'right' });

  y += 13;
  doc.setDrawColor(15, 118, 110);
  doc.setLineWidth(0.7);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 11;

  // ===== IDENTITAS PASIEN =====
  addSectionTitle('Identitas Pasien');
  addFieldRow([
    { label: 'No RM', value: k.no_rm },
    { label: 'Jenis Kelamin', value: k.jenis_kelamin },
  ]);
  addField('Nama', k.nama);
  addFieldRow([
    { label: 'Tanggal Lahir', value: formatTanggal(k.tanggal_lahir) },
    { label: 'NIK', value: k.nik },
  ]);
  addField('Alamat', k.alamat);
  addField('Nama Kepala Keluarga', k.nama_kepala_keluarga);

  // ===== KUNJUNGAN =====
  addSectionTitle('Kunjungan');
  addFieldRow([
    { label: 'Tanggal Kunjungan', value: formatTanggal(k.tanggal_kunjungan) },
    { label: 'Jenis Kunjungan', value: k.jenis_kunjungan },
  ]);

  // ===== ANAMNESA =====
  addSectionTitle('Anamnesa');
  addField('Anamnesa', k.anamnesa);
  addField('Riwayat Alergi', k.riwayat_alergi);

  // ===== PEMERIKSAAN FISIK =====
  addSectionTitle('Pemeriksaan Fisik');
  addFieldRow([
    { label: 'BB (kg)', value: k.bb },
    { label: 'TB (cm)', value: k.tb },
    { label: 'IMT', value: k.imt },
  ]);
  addFieldRow([
    { label: 'TD (Tekanan Darah)', value: k.td },
    { label: 'Nadi (x/menit)', value: k.nadi },
    { label: 'Suhu (°C)', value: k.suhu },
  ]);

  // ===== ASSESMENT & PLANNING =====
  addSectionTitle('Assesment & Planning');
  addField('Assesment', k.asesment);
  addField('Planning', k.planning);

  // Footer halaman
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 160, 157);
    doc.text(`Halaman ${i} dari ${totalPages} — Dokumen internal klinik`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  const namaFile = (k.nama || 'pasien').trim().replace(/[^a-zA-Z0-9]+/g, '_');
  const tanggalFile = k.tanggal_kunjungan || 'tanggal';
  doc.save(`RekamMedis_${namaFile}_${tanggalFile}.pdf`);
}
