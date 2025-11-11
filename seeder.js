/* eslint-disable no-console */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool();

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database dengan 20 data dummy...');

    // Bersihkan semua tabel agar tidak ada duplikat data
    await pool.query('TRUNCATE users, assets, tasks, maintenances RESTART IDENTITY CASCADE;');

    // === USERS ===
    const adminId = `user-${nanoid(10)}`;
    const passwordAdmin = await bcrypt.hash('admin123', 10);
    const passwordTech = await bcrypt.hash('teknisi123', 10);

    // Insert admin
    await pool.query(
      `INSERT INTO users (id, username, password, fullname, role)
       VALUES ($1, 'admin', $2, 'Administrator', 'admin')`,
      [adminId, passwordAdmin]
    );

    // Insert 5 teknisi
    for (let i = 1; i <= 5; i++) {
      const techId = `user-${nanoid(10)}`;
      await pool.query(
        `INSERT INTO users (id, username, password, fullname, role)
         VALUES ($1, $2, $3, $4, 'teknisi')`,
        [techId, `teknisi${i}`, passwordTech, `Teknisi ${i}`]
      );
    }

    const { rows: teknisiUsers } = await pool.query(`SELECT id FROM users WHERE role = 'teknisi'`);
    if (teknisiUsers.length === 0) throw new Error('Tidak ada user teknisi ditemukan.');

    // === ASSETS (20 Data Dummy) ===
    const categories = ['TEKNOLOGI_DAN_IT', 'KELISTRIKAN', 'GEDUNG_DAN_DALAM_RUANGAN'];
    const locations = ['Lantai 1', 'Lantai 2', 'Ruang Server', 'Gudang', 'Ruang Admin'];

    const assets = [];
    for (let i = 1; i <= 20; i++) {
      const id = `asset-${nanoid(10)}`;
      const name = `Peralatan-${i}`;
      const category = categories[i % categories.length];
      const location = locations[i % locations.length];
      assets.push({ id, name, category, location });
      await pool.query(
        `INSERT INTO assets (id, name, category, location, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'available', NOW(), NOW())`,
        [id, name, category, location]
      );
    }

    // === TASKS (20 Data Dummy) ===
    for (let i = 0; i < 20; i++) {
      const id = `task-${nanoid(10)}`;
      const title = `Tugas Perawatan #${i + 1}`;
      const description = `Deskripsi tugas ke-${i + 1}`;
      const assigned_to = teknisiUsers[i % teknisiUsers.length].id;
      const asset_id = assets[i % assets.length].id;
      const status = i % 2 === 0 ? 'on_progress' : 'completed';

      await pool.query(
        `INSERT INTO tasks (id, title, description, assigned_to, asset_id, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [id, title, description, assigned_to, asset_id, status]
      );

      // Jika task masih on_progress, ubah aset jadi unavailable
      if (status === 'on_progress') {
        await pool.query(
          `UPDATE assets SET status = 'unavailable', updated_at = NOW() WHERE id = $1`,
          [asset_id]
        );
      }
    }

    // === MAINTENANCES (20 Data Dummy) ===
    for (let i = 0; i < 20; i++) {
      const id = `maintenance-${nanoid(10)}`;
      const asset_id = assets[i % assets.length].id;
      const description = `Maintenance rutin aset ${i + 1}`;
      const frequency_days = 30 + (i % 3) * 15; // variasi interval: 30, 45, 60
      const assigned_to = teknisiUsers[i % teknisiUsers.length].id;

      await pool.query(
        `INSERT INTO maintenances (id, asset_id, description, frequency_days, next_maintenance_date, assigned_to, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW() + make_interval(days := $4), $5, NOW(), NOW())`,
        [id, asset_id, description, frequency_days, assigned_to]
      );
    }

    console.log('✅ Seeding selesai! (20 aset, 20 task, 20 maintenance)');
  } catch (error) {
    console.error('❌ Gagal seeding:', error);
  } finally {
    await pool.end();
  }
};

seedDatabase();
