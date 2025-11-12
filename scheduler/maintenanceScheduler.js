const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const dayjs = require('dayjs');

const pool = new Pool();

async function generateMaintenanceTasks() {
  try {
    // Ambil jadwal maintenance yang waktunya tiba
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

      // Cegah duplikasi task aktif (on_progress) untuk aset ini
      const existingTask = await pool.query(
        `SELECT id FROM tasks WHERE asset_id = $1 AND status = 'on_progress'`,
        [maintenance.asset_id]
      );

      if (existingTask.rowCount > 0) {
        console.log(`⚠️  Aset ${maintenance.asset_id} sudah memiliki task aktif, dilewati.`);
        continue;
      }

      // Tambahkan task baru, gunakan status 'on_progress' sebagai default awal
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

      // Update jadwal maintenance berikutnya
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

      // Update aset: isi last_maintenance dengan hari ini (atau biarkan jika sudah diisi)
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
  } finally {
    await pool.end();
  }
}

module.exports = { generateMaintenanceTasks };
