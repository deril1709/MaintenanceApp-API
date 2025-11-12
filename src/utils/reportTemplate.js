const PDFDocument = require('pdfkit');
const getStream = require('get-stream');

async function generatePDF(reports) {
  const doc = new PDFDocument({ margin: 40 });
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => buffers);

  // Header
  doc.fontSize(16).text('LAPORAN MAINTENANCE ASET', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Tanggal Dibuat: ${new Date().toLocaleString()}`, { align: 'right' });
  doc.moveDown(2);

  // Table Header
  doc.font('Helvetica-Bold');
  doc.text('No', 50, doc.y);
  doc.text('Aset', 80, doc.y);
  doc.text('Teknisi', 200, doc.y);
  doc.text('Kondisi', 320, doc.y);
  doc.text('Tanggal', 420, doc.y);
  doc.moveDown(1);
  doc.font('Helvetica');

  // Data Rows
  reports.forEach((r, i) => {
    doc.text(String(i + 1), 50, doc.y);
    doc.text(r.asset_name || '-', 80, doc.y);
    doc.text(r.technician_name || '-', 200, doc.y);
    doc.text(r.asset_condition || '-', 320, doc.y);
    doc.text(new Date(r.updated_at).toLocaleDateString(), 420, doc.y);
    doc.moveDown(1);

    // Deskripsi dan Catatan
    doc.fontSize(8).text(`Tugas: ${r.title}`, 80, doc.y);
    if (r.notes) doc.text(`Catatan: ${r.notes}`, 80, doc.y);
    doc.moveDown(1.5);
    doc.fontSize(10);
  });

  doc.end();
  return await getStream.buffer(doc);
}

module.exports = generatePDF;
