const { MaintenancePayloadSchema } = require('./schema');
const InvariantError = require('../../../src/exceptions/InvariantError');

const MaintenancesValidator = {
  validateMaintenancePayload: (payload) => {
    const validationResult = MaintenancePayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = MaintenancesValidator;
