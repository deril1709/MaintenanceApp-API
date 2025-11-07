const InvariantError = require('../../exceptions/InvariantError');
const { AssetPayloadSchema } = require('./schema');

const AssetsValidator = {
  validateAssetPayload: (payload) => {
    const validationResult = AssetPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AssetsValidator;
