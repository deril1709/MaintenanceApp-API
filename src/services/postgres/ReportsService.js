const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');
const PDFDocument = require('pdfkit');

class ReportsService {
  constructor() {
    this._pool = new Pool();
  }

  async getReports() {
    const result = await this._pool.query(`
      SELECT 
        r.*, 
        t.title, 
        a.name AS asset_name,
        u.fullname AS technician_name
      FROM reports r
      JOIN tasks t ON r.task_id = t.id
      LEFT JOIN assets a ON t.asset_id = a.id
      LEFT JOIN users u ON t.assigned_to = u.id
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
        a.location,
        u.fullname AS technician_name
      FROM reports r
      JOIN tasks t ON r.task_id = t.id
      LEFT JOIN assets a ON t.asset_id = a.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE r.task_id = $1
    `, [taskId]);

    if (!result.rowCount) {
      throw new NotFoundError('Laporan untuk tugas ini tidak ditemukan');
    }

    return result.rows[0];
  }

  async generateReportsPDF(taskId) {
    const r = await this.getReportByTaskId(taskId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve({
        buffer: Buffer.concat(chunks),
        filename: `report-task-${taskId}.pdf`,
      }));
      doc.on('error', reject);

      // === Header ===
      doc.font('Times-Bold');
      doc.fontSize(16).text('LAPORAN MAINTENANCE ASET', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Tanggal Dibuat: ${new Date().toLocaleString()}`, { align: 'right' });
      doc.moveDown(2);

      // === Detail ===
      doc.font('Helvetica-Bold');
      doc.text(`Nama Aset: `, { continued: true }).font('Helvetica').text(r.asset_name || '-');
      doc.text(`Lokasi: `, { continued: true }).font('Helvetica').text(r.location || '-');
      doc.text(`Kondisi Aset: `, { continued: true }).font('Helvetica').text(r.asset_condition || '-');
      doc.text(`Teknisi: `, { continued: true }).font('Helvetica').text(r.technician_name || '-');
      doc.text(`Tanggal Update: `, { continued: true }).font('Helvetica').text(new Date(r.updated_at).toLocaleString());
      doc.moveDown(1.5);

      doc.font('Helvetica-Bold').text('Deskripsi Tugas:');
      doc.font('Helvetica').text(r.title || '-');
      doc.moveDown();

      if (r.notes) {
        doc.font('Helvetica-Bold').text('Catatan Tambahan:');
        doc.font('Helvetica').text(r.notes || '-');
      }

      doc.moveDown(2);
      doc.font('Helvetica-Oblique').fontSize(10).text('--- Akhir Laporan ---', { align: 'center' });

      doc.end();
    });
  }
}

module.exports = ReportsService;
