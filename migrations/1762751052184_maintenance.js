exports.up = (pgm) => {
  pgm.createTable('maintenances', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    asset_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'assets(id)',
      onDelete: 'CASCADE',
    },
    description: {
      type: 'TEXT',
      notNull: true,
    },
    frequency_days: {
      type: 'INTEGER',
      notNull: true,
      check: 'frequency_days > 0',
    },
    next_maintenance_date: {
      type: 'DATE',
      notNull: true,
    },
    assigned_to: {
      type: 'VARCHAR(50)',
      references: '"users"(id)',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
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
  pgm.dropTable('maintenances');
};
