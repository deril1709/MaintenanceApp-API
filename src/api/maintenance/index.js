const MaintenancesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'maintenances',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const handler = new MaintenancesHandler(service, validator);
    server.route(routes(handler));
  },
};
