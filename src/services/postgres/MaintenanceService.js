const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');
const { nanoid } = require('nanoid');``

class MaintenancesService {
  constructor() {
    this._pool = new Pool();
  }

  async addMaintenance({ asset_id, description, frequency_days, assigned_to }) {
    const assetCheck = await this._pool.query('SELECT id FROM assets WHERE id = $1', [asset_id]);
    if (!assetCheck.rowCount) throw new NotFoundError('Asset tidak ditemukan');

    const id = `maintenance-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const nextMaintenanceDate = new Date();
    nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + frequency_days);

    const query = {
      text: `INSERT INTO maintenances
        (id, asset_id, description, frequency_days, assigned_to, next_maintenance_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      values: [id, asset_id, description, frequency_days, assigned_to, nextMaintenanceDate, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new InvariantError('Gagal menambahkan jadwal maintenance');
    return result.rows[0].id;
  }

  async getMaintenances() {
    const result = await this._pool.query(`
      SELECT m.*, a.name AS asset_name
      FROM maintenances m
      LEFT JOIN assets a ON a.id = m.asset_id
      ORDER BY m.created_at DESC
    `);
    return result.rows;
  }

  async updateNextMaintenanceDate(maintenanceId, nextDate) {
    const updatedAt = new Date().toISOString();
    await this._pool.query(
      'UPDATE maintenances SET next_maintenance_date = $1, updated_at = $2 WHERE id = $3',
      [nextDate, updatedAt, maintenanceId]
    );
  }
}

module.exports = MaintenancesService;
