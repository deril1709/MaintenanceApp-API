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

  async updateTaskStatus(id, status) {
    const validStatuses = ['pending', 'progress', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new InvariantError('Status task tidak valid');
    }

    // Cek apakah task ada dan ambil asset_id
    const taskResult = await this._pool.query(
      'SELECT asset_id FROM tasks WHERE id = $1',
      [id],
    );

    if (!taskResult.rowCount) throw new NotFoundError('Tugas tidak ditemukan');

    const { asset_id } = taskResult.rows[0];
    const updatedAt = new Date().toISOString();

    // Update status task
    await this._pool.query(
      'UPDATE tasks SET status = $1, updated_at = $2 WHERE id = $3',
      [status, updatedAt, id],
    );

    // Update status asset secara otomatis (tanpa trigger)
    if (status === 'progress') {
      await this._pool.query(
        'UPDATE assets SET status = $1, updated_at = $2 WHERE id = $3',
        ['unavailable', updatedAt, asset_id],
      );
    }

    if (status === 'completed') {
      await this._pool.query(
        'UPDATE assets SET status = $1, updated_at = $2 WHERE id = $3',
        ['available', updatedAt, asset_id],
      );
    }
  }
}

module.exports = TasksService;
