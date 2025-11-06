const AuthorizationError = require('../exceptions/AuthorizationError');

const verifyAdmin = (role) => {
  if (role !== 'admin') {
    throw new AuthorizationError('Hanya admin yang dapat melakukan aksi ini');
  }
};

const verifyTechnician = (role) => {
  if (role !== 'teknisi') {
    throw new AuthorizationError('Hanya teknisi yang dapat melakukan aksi ini');
  }
};

module.exports = { verifyAdmin, verifyTechnician };
