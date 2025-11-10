const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const pool = new Pool();

async function generateMaintenanceTasks() {
  try {
    // Ambil maintenance yang sudah waktunya dibuat task
    const result = await pool.query(`
      SELECT * FROM maintenances
      WHERE next_maintenance_date <= NOW()::date
    `);

    for (const maintenance of result.rows) {
      const taskId = `task-${nanoid(16)}`;
      const createdAt = new Date().toISOString();

      // Tambahkan task baru berdasarkan maintenance
      await pool.query(`
        INSERT INTO tasks (id, title, description, asset_id, assigned_to, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, 'pending', $6, $6)
      `, [
        taskId,
        'Scheduled Maintenance',
        maintenance.description || 'Perawatan rutin aset otomatis dari jadwal maintenance.',
        maintenance.asset_id,
        maintenance.assigned_to || null,
        createdAt,
      ]);

      // Perbarui tanggal maintenance berikutnya
      await pool.query(`
        UPDATE maintenances
        SET next_maintenance_date = NOW()::date + (frequency_days || ' days')::interval,
            updated_at = $2
        WHERE id = $1
      `, [maintenance.id, createdAt]);
    }

    console.log(`[${new Date().toISOString()}] Maintenance tasks generated: ${result.rowCount}`);
  } catch (error) {
    console.error('❌ Error generating maintenance tasks:', error);
  } finally {
    await pool.end();
  }
}

module.exports = { generateMaintenanceTasks };
