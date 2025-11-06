const TasksHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'tasks',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const handler = new TasksHandler(service, validator);
    server.route(routes(handler));
  },
};
