const { verifyAdmin, verifyTechnician } = require('../../middlewares/authorization');

class TasksHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postTaskHandler = this.postTaskHandler.bind(this);
    this.getTasksHandler = this.getTasksHandler.bind(this);
    this.putTaskStatusHandler = this.putTaskStatusHandler.bind(this);
  }

  async postTaskHandler(request, h) {
    const { role } = request.auth.credentials;
    verifyAdmin(role);

    this._validator.validateTaskPayload(request.payload);
    const { title, description, assigned_to } = request.payload;

    const taskId = await this._service.addTask({ title, description, assigned_to });

    const response = h.response({
      status: 'success',
      message: 'Tugas berhasil ditambahkan',
      data: { taskId },
    });
    response.code(201);
    return response;
  }

  async getTasksHandler(request) {
    const { role, id } = request.auth.credentials;

    const tasks =
      role === 'admin'
        ? await this._service.getAllTasks()
        : await this._service.getTasksByTechnician(id);

    return {
      status: 'success',
      data: { tasks },
    };
  }

  async putTaskStatusHandler(request) {
    const { role } = request.auth.credentials;
    verifyTechnician(role);

    const { id } = request.params;
    this._validator.validateTaskStatus(request.payload);
    const { status } = request.payload;

    await this._service.updateTaskStatus(id, status);

    return {
      status: 'success',
      message: 'Status tugas berhasil diperbarui',
    };
  }
}

module.exports = TasksHandler;
