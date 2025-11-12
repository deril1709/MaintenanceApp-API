exports.up = (pgm) => {
  pgm.createTable('reports', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    task_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'tasks(id)',
      onDelete: 'CASCADE',
    },
    asset_condition: {
      type: 'TEXT',
      notNull: true,
    },
    notes: {
      type: 'TEXT',
      notNull: false,
    },
    technician_name: {
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
  pgm.dropTable('reports');
};
