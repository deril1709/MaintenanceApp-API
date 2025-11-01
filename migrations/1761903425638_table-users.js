/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    username: {
      type: 'VARCHAR(50)',
      notNull: true,
      unique: true,
    },
    password: {
      type: 'TEXT',
      notNull: true,
    },
    fullname: {
      type: 'TEXT',
      notNull: true,
    },
    role: {
      type: 'VARCHAR(20)',
      notNull: true,
      default: 'teknisi',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
