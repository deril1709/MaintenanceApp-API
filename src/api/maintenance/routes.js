const routes = (handler) => [
  {
    method: 'POST',
    path: '/maintenances',
    handler: handler.postMaintenanceHandler,
  },
  {
    method: 'GET',
    path: '/maintenances',
    handler: handler.getMaintenancesHandler,
  },
];

module.exports = routes;
