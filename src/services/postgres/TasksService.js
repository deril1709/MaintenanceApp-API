const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class TasksService {
  constructor() {
    this._pool = new Pool();
  }

  async addTask({ title, description, assigned_to, asset_id }) {
  const id = `task-${nanoid(16)}`;
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;

  // 1️⃣ Cek apakah asset tersedia
  const assetCheck = await this._pool.query({
    text: 'SELECT status FROM assets WHERE id = $1',
    values: [asset_id],
  });

  if (!assetCheck.rowCount) {
    throw new NotFoundError('Asset tidak ditemukan');
  }

  if (assetCheck.rows[0].status !== 'available') {
    throw new InvariantError('Asset sedang tidak tersedia');
  }

  // 2️⃣ Tambah task baru
  const query = {
    text: `INSERT INTO tasks (id, title, description, assigned_to, asset_id, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, 'on_progress', $6, $7)
           RETURNING id`,
    values: [id, title, description, assigned_to, asset_id, createdAt, updatedAt],
  };

  const result = await this._pool.query(query);

  if (!result.rows.length) {
    throw new InvariantError('Gagal menambahkan tugas');
  }

  // 3️⃣ Ubah status aset menjadi unavailable setelah task berhasil dibuat
  await this._pool.query(
    `UPDATE assets SET status = 'unavailable', updated_at = $1 WHERE id = $2`,
    [updatedAt, asset_id]
  );

  return result.rows[0].id;
}


  async getAllTasks() {
    const result = await this._pool.query(`
      SELECT t.*, a.name AS asset_name
      FROM tasks t
      LEFT JOIN assets a ON a.id = t.asset_id
      ORDER BY t.created_at DESC
    `);
    return result.rows;
  }

  async getTasksByTechnician(technicianId) {
    const result = await this._pool.query(
      'SELECT * FROM tasks WHERE assigned_to = $1 ORDER BY created_at DESC',
      [technicianId],
    );
    return result.rows;
  }

  async updateTaskStatus(id, status, asset_condition, notes, technicianId) {
  const updatedAt = new Date().toISOString();

  // Pastikan task milik teknisi login
  const verifyQuery = {
    text: 'SELECT * FROM tasks WHERE id = $1 AND assigned_to = $2',
    values: [id, technicianId],
  };
  const verifyResult = await this._pool.query(verifyQuery);
  if (!verifyResult.rowCount) {
    throw new NotFoundError('Tugas tidak ditemukan atau bukan milik Anda');
  }

  // Update status dan detail
  const query = {
    text: `
      UPDATE tasks
      SET status = $1, asset_condition = $2, notes = $3, updated_at = $4
      WHERE id = $5
      RETURNING id, asset_id, assigned_to
    `,
    values: [status, asset_condition, notes, updatedAt, id],
  };

  const result = await this._pool.query(query);
  if (!result.rowCount) {
    throw new NotFoundError('Gagal memperbarui status tugas');
  }

  // Jika status completed → buat laporan
  if (status === 'completed') {
  const { nanoid } = await import('nanoid');
  const reportId = `report-${nanoid(10)}`;

  const userQuery = await this._pool.query(
    'SELECT fullname FROM users WHERE id = $1',
    [technicianId]
  );
  const technician_name = userQuery.rows[0]?.fullname || 'Unknown';

  await this._pool.query(
    `INSERT INTO reports (id, task_id, asset_condition, notes, technician_name, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [reportId, id, asset_condition, notes, technician_name, updatedAt]
  );

  const assetId = result.rows[0].asset_id;
  const today = updatedAt.split('T')[0]; // yyyy-mm-dd

  await this._pool.query(
    `UPDATE assets 
     SET status = 'available', last_maintenance = $1, updated_at = NOW()
     WHERE id = $2`,
    [today, assetId]
  );
}


  return result.rows[0].id;
}

  async getCompletedTasks() {
  const result = await this._pool.query(`
    SELECT 
      t.id AS task_id,
      t.title,
      t.description,
      t.status,
      t.updated_at AS completed_at,
      a.id AS asset_id,
      a.name AS asset_name,
      a.location,
      u.id AS technician_id,
      u.fullname AS technician_name
    FROM tasks t
    LEFT JOIN assets a ON t.asset_id = a.id
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE t.status = 'completed'
    ORDER BY t.updated_at DESC;
  `);

  return result.rows;
}

}

module.exports = TasksService;
