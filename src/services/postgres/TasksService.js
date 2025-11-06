const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class TasksService {
  constructor() {
    this._pool = new Pool;
  }

  async addTask({ title, description, assigned_to }) {
    const id = `task-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: `INSERT INTO tasks (id, title, description, assigned_to, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, 'pending', $5, $6)
             RETURNING id`,
      values: [id, title, description, assigned_to, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan tugas');
    }

    return result.rows[0].id;
  }

  async getAllTasks() {
    const result = await this._pool.query(
      `SELECT tasks.*, users.username AS assigned_user
       FROM tasks
       JOIN users ON users.id = tasks.assigned_to
       ORDER BY tasks.created_at DESC`
    );
    return result.rows;
  }

  async getTasksByTechnician(technicianId) {
    const result = await this._pool.query(
      `SELECT * FROM tasks WHERE assigned_to = $1 ORDER BY created_at DESC`,
      [technicianId]
    );
    return result.rows;
  }

  async updateTaskStatus(id, status) {
    const updatedAt = new Date().toISOString();
    const result = await this._pool.query(
      `UPDATE tasks SET status = $1, updated_at = $2 WHERE id = $3 RETURNING id`,
      [status, updatedAt, id]
    );

    if (!result.rowCount) throw new NotFoundError('Tugas tidak ditemukan');
  }
}

module.exports = TasksService;
