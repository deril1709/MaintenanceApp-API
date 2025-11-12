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

  async getReportByTaskId(taskId) {
    const result = await this._pool.query(`
      SELECT 
        r.*, 
        t.title, 
        t.description, 
        a.name AS asset_name, 
        a.location
      FROM reports r
      JOIN tasks t ON r.task_id = t.id
      LEFT JOIN assets a ON t.asset_id = a.id
      WHERE r.task_id = $1
    `, [taskId]);

    if (!result.rowCount) {
      throw new NotFoundError('Laporan untuk tugas ini tidak ditemukan');
    }

    return result.rows[0];
  }

  async generateReportsPDF(taskId) {
    const report = await this.getReportByTaskId(taskId);
    if (!report) throw new NotFoundError('Laporan tidak ditemukan');

    const filename = `report-${taskId}.pdf`;
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    // === Header ===
    doc.fontSize(18).text('LAPORAN MAINTENANCE ASET', { align: 'center' });
    doc.moveDown();

    // === Detail ===
    doc.fontSize(12);
    doc.text(`ID Tugas       : ${report.task_id}`);
    doc.text(`Nama Aset       : ${report.asset_name}`);
    doc.text(`Lokasi          : ${report.location}`);
    doc.text(`Kondisi Aset    : ${report.asset_condition}`);
    doc.text(`Catatan         : ${report.notes || '-'}`);
    doc.text(`Teknisi         : ${report.technician_name}`);
    doc.text(`Tanggal Update  : ${new Date(report.updated_at).toLocaleString()}`);
    doc.moveDown();

    doc.text('--- END OF REPORT ---', { align: 'center' });
    doc.end();

    const buffer = await new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    return { buffer, filename };
  }
}

module.exports = ReportsService;
