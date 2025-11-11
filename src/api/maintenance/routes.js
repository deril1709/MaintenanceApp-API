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
  {
    method: 'GET',
    path: '/maintenances/alerts',
    handler: handler.getUpcomingMaintenancesHandler,
  },
];

module.exports = routes;
