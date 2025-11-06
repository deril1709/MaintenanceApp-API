const routes = (handler) => [
  {
    method: 'POST',
    path: '/tasks',
    handler: handler.postTaskHandler,
    options: {
      auth: 'maintenanceapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/tasks',
    handler: handler.getTasksHandler,
    options: {
      auth: 'maintenanceapp_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/tasks/{id}/status',
    handler: handler.putTaskStatusHandler,
    options: {
      auth: 'maintenanceapp_jwt',
    },
  },
];

module.exports = routes;
