const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AssetsService {
  constructor() {
    this._pool = new Pool;
  }

async addAsset({ name, category, location, status = 'available' }) {
  const id = `asset-${nanoid(10)}`;
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;

  const query = {
    text: `INSERT INTO assets (id, name, category, location, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
    values: [id, name, category, location, status, createdAt, updatedAt],
  };

  const result = await this._pool.query(query);

  if (!result.rows.length) {
    throw new InvariantError('Gagal menambahkan aset');
  }

  return result.rows[0].id;
}



  async getAssets() {
    const result = await this._pool.query('SELECT * FROM assets ORDER BY created_at DESC');
    return result.rows;
  }

  async getAssetById(id) {
    const query = {
      text: 'SELECT * FROM assets WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Aset tidak ditemukan');
    }
    return result.rows[0];
  }

  async editAssetById(id, { name, category, location, status }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: `UPDATE assets 
             SET name = $1, category = $2, location = $3, status = $4, updated_at = $5
             WHERE id = $6 RETURNING id`,
      values: [name, category, location, status, updatedAt, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui aset. Id tidak ditemukan');
    }
  }

  async deleteAssetById(id) {
    const query = {
      text: 'DELETE FROM assets WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus aset. Id tidak ditemukan');
    }
  }
}

module.exports = AssetsService;
