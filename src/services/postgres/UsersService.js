const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const InvariantError = require("../../exceptions/InvariantError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    // Cek apakah username sudah digunakan
    const checkQuery = {
      text: "SELECT id FROM users WHERE username = $1",
      values: [username],
    };
    const result = await this._pool.query(checkQuery);
    if (result.rowCount > 0) {
      throw new InvariantError("Username sudah digunakan");
    }

    const id = `user-${Date.now()}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = "teknisi";

    const query = {
      text: "INSERT INTO users VALUES($1, $2, $3, $4, $5) RETURNING id",
      values: [id, username, hashedPassword, fullname, role],
    };

    const insertResult = await this._pool.query(query);
    return insertResult.rows[0].id;
  }

  async getUserByUsername(username) {
    const query = {
      text: "SELECT * FROM users WHERE username = $1",
      values: [username],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async getUserTechnicians() {
    const result = await this._pool.query(
      "SELECT id, username, fullname FROM users WHERE role='teknisi' ORDER BY fullname ASC"
    );
    return result.rows;
  }

  async verifyUserCredential(username, password) {
    const query = {
      text: "SELECT id, username, password, role FROM users WHERE username = $1",
      values: [username],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthenticationError("Kredensial yang Anda berikan salah");
    }

    const { id, password: hashedPassword, role } = result.rows[0];

    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      throw new AuthenticationError("Kredensial yang Anda berikan salah");
    }

    return { id, username, role };
  }

    async getUserById(id) {
    const query = {
      text: "SELECT id, username, fullname, role FROM users WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(`User dengan id ${id} tidak ditemukan`);
    }

    return result.rows[0];
  }
  
  async findAdmin() {
    const query = {
      text: "SELECT id FROM users WHERE role = $1 LIMIT 1",
      values: ["admin"],
    };
    const result = await this._pool.query(query);
    return result.rowCount > 0 ? result.rows[0] : null;
  }
}

module.exports = UsersService;
