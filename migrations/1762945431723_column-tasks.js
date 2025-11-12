exports.up = (pgm) => {
  pgm.addColumns('tasks', {
    asset_condition: {
      type: 'TEXT',
      notNull: false,
      comment: 'Kondisi aset setelah maintenance dilakukan',
    },
    notes: {
      type: 'TEXT',
      notNull: false,
      comment: 'Catatan tambahan dari teknisi',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('tasks', ['asset_condition', 'notes']);
};
