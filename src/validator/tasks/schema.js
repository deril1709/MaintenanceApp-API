const Joi = require('joi');

const TaskPayloadSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  assigned_to: Joi.string().required(),
});

const TaskStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'in_progress', 'completed').required(),
});

module.exports = { TaskPayloadSchema, TaskStatusSchema };
