const Joi = require('joi');

const AssetPayloadSchema = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().required(),
  location: Joi.string().allow('', null),
  status: Joi.string().valid('available', 'in-use', 'maintenance', 'rusak').optional(),
});

module.exports = { AssetPayloadSchema };
