const routes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler,
  },
  {
  method: 'POST',
  path: '/users/admin',
  handler: handler.postAdminUserHandler,
}

];

module.exports = routes;
