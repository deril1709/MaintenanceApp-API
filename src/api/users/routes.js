const routes = (handler) => [
  {
    method: "POST",
    path: "/users",
    handler: handler.postUserHandler,
  },
  {
    method: "POST",
    path: "/users/admin",
    handler: handler.postAdminUserHandler,
  },
  { method: "GET", 
    path: "/users/get-technicians", 
    handler: handler.getUserTechniciansHandler 
  },
  {
    method: "GET",
    path: "/users/{id}",
    handler: handler.getUserByIdHandler,
  }
];

module.exports = routes;
