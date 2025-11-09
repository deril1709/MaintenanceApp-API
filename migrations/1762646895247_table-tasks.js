exports.up = (pgm) => {
  // Buat tipe ENUM baru untuk status tugas
  pgm.createType('task_status', ['on_progress', 'completed']);

  pgm.createTable('tasks', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
    },
    description: {
      type: 'TEXT',
      notNull: true,
    },
    assigned_to: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'cascade',
    },
    asset_id: {
      type: 'VARCHAR(50)',
      references: '"assets"(id)',
      onDelete: 'CASCADE',
    },
    status: {
      type: 'task_status',
      notNull: true,
      default: 'on_progress',
    },
    created_at: {
      type: 'TEXT',
      notNull: true,
    },
    updated_at: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('tasks');
  pgm.dropType('task_status');
};
