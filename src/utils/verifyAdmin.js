const AuthorizationError = require('../exceptions/AuthorizationError');

const verifyAdmin = (role) => {
  if (role !== 'admin') {
    throw new AuthorizationError('Akses ditolak: hanya admin yang bisa melakukan tindakan ini');
  }
};

module.exports = verifyAdmin;
