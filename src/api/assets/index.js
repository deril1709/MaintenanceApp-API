const AssetsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'assets',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const assetsHandler = new AssetsHandler(service, validator);
    server.route(routes(assetsHandler));
  },
};
