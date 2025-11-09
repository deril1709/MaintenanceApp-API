/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
  // 1️⃣ Buat enum untuk status aset
  pgm.createType('asset_status', ['available', 'unavailable']);
  pgm.createType('asset_category', ['GEDUNG_DAN_DALAM_RUANGAN', 'KELISTRIKAN', 'SISTEM_AIR_DAN_SANITASI', 'TEKNOLOGI_DAN_IT', 'MOBILITAS_DAN_LUAR_RUANG', 'KEAMANAN_DAN_KESELAMATAN', 'LAINNYA']);

  // 2️⃣ Buat tabel assets
  pgm.createTable('assets', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    category: {
      type: 'asset_category',
      notNull: true,
    },
    location: {
      type: 'TEXT',
      notNull: false,
    },
    status: {
      type: 'asset_status',
      notNull: false,
      default: 'available'
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
    },
    updated_at: {
      type: 'TIMESTAMP',
      notNull: true,
    },
  });
};

exports.down = pgm => {
  pgm.dropTable('assets');
  pgm.dropType('asset_status');
  pgm.dropType('asset_category');
};
