const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const dayjs = require('dayjs');

const pool = new Pool();

async function generateMaintenanceTasks() {
  console.log(`[${new Date().toISOString()}] 🔄 Memeriksa jadwal maintenance...`);
  try {
    // Ambil jadwal maintenance yang sudah waktunya dibuat task
    const result = await pool.query(`
      SELECT m.*, a.name AS asset_name, a.last_maintenance
      FROM maintenances m
      JOIN assets a ON a.id = m.asset_id
      WHERE m.next_maintenance_date <= NOW()::date
    `);

    if (!result.rowCount) {
      console.log(`[${new Date().toISOString()}] Tidak ada maintenance yang perlu dibuat.`);
      return;
    }

    for (const maintenance of result.rows) {
      const taskId = `task-${nanoid(16)}`;
      const createdAt = new Date().toISOString();

      // Cek apakah hari ini sudah dibuat task untuk aset ini
      const existingTask = await pool.query(
        `
        SELECT id FROM tasks 
        WHERE asset_id = $1 
          AND status IN ('on_progress')
          AND created_at::date = NOW()::date
        `,
        [maintenance.asset_id]
      );

      if (existingTask.rowCount > 0) {
        console.log(`⚠️  Aset ${maintenance.asset_name} sudah memiliki task aktif untuk hari ini.`);
        continue;
      }

      // Buat task baru (mulai dari pending, nanti teknisi bisa ubah ke on_progress)
      await pool.query(
        `
        INSERT INTO tasks (id, title, description, asset_id, assigned_to, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, 'on_progress', $6, $6)
        `,
        [
          taskId,
          `Scheduled Maintenance - ${maintenance.asset_name}`,
          maintenance.description ||
            'Perawatan rutin aset otomatis dari jadwal maintenance.',
          maintenance.asset_id,
          maintenance.assigned_to || null,
          createdAt,
        ]
      );

      // Hitung tanggal maintenance berikutnya
      const nextMaintenanceDate = dayjs()
        .add(maintenance.frequency_days, 'day')
        .format('YYYY-MM-DD');

      await pool.query(
        `
        UPDATE maintenances
        SET next_maintenance_date = $2,
            updated_at = $3
        WHERE id = $1
        `,
        [maintenance.id, nextMaintenanceDate, createdAt]
      );

      // Update last_maintenance jika masih null
      await pool.query(
        `
        UPDATE assets
        SET last_maintenance = COALESCE(last_maintenance, NOW()::date),
            updated_at = $2
        WHERE id = $1
        `,
        [maintenance.asset_id, createdAt]
      );

      console.log(`✅ Task baru dibuat untuk aset: ${maintenance.asset_name}`);
    }

    console.log(`[${new Date().toISOString()}] Maintenance tasks generated: ${result.rowCount}`);
  } catch (error) {
    console.error('❌ Error generating maintenance tasks:', error);
  }
}

// Jangan tutup pool di sini, biarkan scheduler yang memanggil fungsi ini secara berkala.
module.exports = { generateMaintenanceTasks };
