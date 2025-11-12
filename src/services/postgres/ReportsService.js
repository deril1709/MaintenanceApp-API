const { Pool } = require('pg');
const PDFDocument = require('pdfkit');
const NotFoundError = require('../../exceptions/NotFoundError');

class ReportsService {
  constructor() {
    this._pool = new Pool();
  }

  async getReports() {
    const result = await this._pool.query(`
      SELECT r.*, t.title, a.name AS asset_name
      FROM reports r
      JOIN tasks t ON r.task_id = t.id
      LEFT JOIN assets a ON t.asset_id = a.id
      ORDER BY r.updated_at DESC
    `);
    return result.rows;
  }

  async getReportById(id) {
    const result = await this._pool.query(`
      SELECT 
        r.*, 
        t.title, 
        t.description, 
        a.name AS asset_name, 
        a.location,
        u.fullname AS technician_name
      FROM reports r
      JOIN tasks t ON r.task_id = t.id
      LEFT JOIN assets a ON t.asset_id = a.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE r.id = $1
    `, [id]);

    if (!result.rowCount) {
      throw new NotFoundError('Laporan tidak ditemukan');
    }

    return result.rows[0];
  }

  async generateReportsPDF(reportId) {
  const report = await this.getReportById(reportId);
  if (!report) throw new Error('Laporan tidak ditemukan');

  const filename = `report-${reportId}.pdf`;
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];

  // Tangkap data PDF ke buffer
  doc.on('data', (chunk) => chunks.push(chunk));

  // === Header ===
  doc.fontSize(18).text('LAPORAN MAINTENANCE ASET', { align: 'center' });
  doc.moveDown();

  // === Detail ===
  doc.fontSize(12);
  doc.text(`ID Laporan: ${report.id}`);
  doc.text(`Nama Aset: ${report.asset_name}`);
  doc.text(`Lokasi: ${report.location}`);
  doc.text(`Kondisi Aset: ${report.asset_condition}`);
  doc.text(`Catatan: ${report.notes || '-'}`);
  doc.text(`Teknisi: ${report.technician_name}`);
  doc.text(`Tanggal Update: ${new Date(report.updated_at).toLocaleString()}`);
  doc.moveDown();

  doc.text('--- END OF REPORT ---', { align: 'center' });

  // Tutup stream PDF
  doc.end();

  // Tunggu sampai selesai ditulis
  const buffer = await new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  return { buffer, filename };
}
}

module.exports = ReportsService;
