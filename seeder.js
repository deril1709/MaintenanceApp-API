/* eslint-disable no-console */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool();

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Bersihkan tabel biar tidak duplikat
    await pool.query('TRUNCATE users, assets, tasks RESTART IDENTITY CASCADE;');

    // === USERS ===
    const adminId = `user-${nanoid(10)}`;
    const techId1 = `user-${nanoid(10)}`;
    const techId2 = `user-${nanoid(10)}`;

     // Hash password sebelum disimpan
    const passwordAdmin = await bcrypt.hash('admin123', 10);
    const passwordTech1 = await bcrypt.hash('teknisi123', 10);
    const passwordTech2 = await bcrypt.hash('teknisi123', 10);

    await pool.query(`
      INSERT INTO users (id, username, password, fullname, role)
      VALUES
        ('${adminId}', 'admin', '${passwordAdmin}', 'Administrator', 'admin'),
        ('${techId1}', 'teknisi1', '${passwordTech1}', 'Teknisi Satu', 'teknisi'),
        ('${techId2}', 'teknisi2', '${passwordTech2}', 'Teknisi Dua', 'teknisi');
    `);

    // === ASSETS ===
    const asset1 = `asset-${nanoid(10)}`;
    const asset2 = `asset-${nanoid(10)}`;
    const asset3 = `asset-${nanoid(10)}`;
    
    
    await pool.query(`
      INSERT INTO assets (id, name, category, location, status, created_at, updated_at)
      VALUES
        ('${asset1}', 'AC Central', 'TEKNOLOGI_DAN_IT', 'Lantai 2', 'available' ,NOW(), NOW()),
        ('${asset2}', 'Genset 2500W', 'KELISTRIKAN', 'Ruang Mesin', 'available', NOW(), NOW()),
        ('${asset3}', 'Printer Canon G2010', 'GEDUNG_DAN_DALAM_RUANGAN', 'Lantai 1', 'available', NOW(), NOW());
    `);

    // === TASKS ===
    const task1 = `task-${nanoid(10)}`;
    const task2 = `task-${nanoid(10)}`;

    await pool.query(`
      INSERT INTO tasks (id, title, description, assigned_to, asset_id, status, created_at, updated_at)
      VALUES
        ('${task1}', 'Perawatan AC', 'Cuci filter dan cek freon', '${techId1}', '${asset1}', 'completed', NOW(), NOW()),
        ('${task2}', 'Pengecekan Genset', 'Tes beban ringan', '${techId2}', '${asset2}', 'on_progress', NOW(), NOW());
    `);

    // // === MAINTENANCES ===
    // const maintenance1 = `maintenance-${nanoid(10)}`;
    // const maintenance2 = `maintenance-${nanoid(10)}`;

    // await pool.query(`
    //   INSERT INTO maintenances (id, asset_id, description, frequency_days, next_maintenance_date, created_at, updated_at)
    //   VALUES
    //     ('${maintenance1}', '${asset1}', 'Maintenance rutin AC', 30, NOW() + INTERVAL '3 days', NOW(), NOW()),
    //     ('${maintenance2}', '${asset3}', 'Tes cetak dan pembersihan printer', 90, NOW() + INTERVAL '7 days', NOW(), NOW());
    // `);

    console.log('✅ Seeding selesai!');
  } catch (error) {
    console.error('❌ Gagal seeding:', error);
  } finally {
    await pool.end();
  }
};

seedDatabase();
