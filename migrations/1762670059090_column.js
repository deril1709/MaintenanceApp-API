exports.up = (pgm) => {
  pgm.addColumn('assets', {
    last_maintenance: {
      type: 'DATE',
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('assets', 'last_maintenance');
};