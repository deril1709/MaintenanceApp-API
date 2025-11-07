const routes = (handler) => [
  { method: 'POST',
    path: '/assets',
    handler: handler.postAssetHandler 
  },
  { method: 'GET',
    path: '/assets',
    handler: handler.getAssetsHandler 
  },
  { method: 'GET',
    path: '/assets/{id}',
    handler: handler.getAssetByIdHandler 
  },
  { method: 'PUT',
    path: '/assets/{id}',
    handler: handler.putAssetByIdHandler 
  },
  { method: 'DELETE',
    path: '/assets/{id}',
    handler: handler.deleteAssetByIdHandler 
  },
];

module.exports = routes;
