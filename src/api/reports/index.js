const ReportsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'reports',
  version: '1.0.0',
  register: async (server, { service }) => {
    const handler = new ReportsHandler(service);
    server.route(routes(handler));
  },
};
