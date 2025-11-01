const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    // Cek apakah username sudah digunakan
    const checkQuery = {
      text: 'SELECT id FROM users WHERE username = $1',
      values: [username],
    };
    const result = await this._pool.query(checkQuery);
    if (result.rowCount > 0) {
      throw new InvariantError('Username sudah digunakan');
    }

    const id = `user-${Date.now()}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = 'teknisi';

    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, username, hashedPassword, fullname, role],
    };

    const insertResult = await this._pool.query(query);
    return insertResult.rows[0].id;
  }
}

module.exports = UsersService;
