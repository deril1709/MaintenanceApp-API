const Joi = require('joi');

const MaintenancePayloadSchema = Joi.object({
  asset_id: Joi.string().required(),
  description: Joi.string().required(),
  frequency_days: Joi.number().integer().min(1).required(),
  assigned_to: Joi.string().allow(null).optional(),
});

module.exports = { MaintenancePayloadSchema };
