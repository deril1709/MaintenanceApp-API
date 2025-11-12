const routes = (handler) => [
  {
    method: 'GET',
    path: '/reports',
    handler: handler.getReportsHandler,
    options: {
      auth: 'maintenanceapp_jwt',
      tags: ['api', 'reports'],
    },
  },
  {
  method: 'GET',
  path: '/reports/{id}', // id = task_id
  handler: handler.getReportByTaskHandler,
  options: {
    auth: 'maintenanceapp_jwt',
    tags: ['api', 'reports'],
  },
}
,
  {
  method: 'GET',
  path: '/reports/{id}/export',
  handler: handler.exportReportsHandler,
  options: {
    auth: 'maintenanceapp_jwt',
    tags: ['api', 'reports'],
  },
},
];

module.exports = routes;
