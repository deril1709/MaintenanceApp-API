const { TaskPayloadSchema, TaskStatusSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const TasksValidator = {
  validateTaskPayload: (payload) => {
    const result = TaskPayloadSchema.validate(payload);
    if (result.error) throw new InvariantError(result.error.message);
  },
  validateTaskStatus: (payload) => {
    const result = TaskStatusSchema.validate(payload, { abortEarly: false });
    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },
};

module.exports = TasksValidator;
