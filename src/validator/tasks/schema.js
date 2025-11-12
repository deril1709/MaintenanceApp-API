const Joi = require('joi');

const TaskPayloadSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  assigned_to: Joi.string().required(),
  asset_id: Joi.string().required()
});

const TaskStatusSchema = Joi.object({
  status: Joi.string().valid('on_progress', 'completed', 'pending').required(),
  asset_condition: Joi.string().allow(null, '').required(),
  notes: Joi.string().allow(null, '').required(),
});

module.exports = { TaskPayloadSchema, TaskStatusSchema };
