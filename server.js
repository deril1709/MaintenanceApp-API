require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// Plugin users
const users = require('./src/api/users');

//plugin authentications
const authentications = require('./src/api/authentications')

// Services
const UsersService = require('./src/services/postgres/UsersService');

// Validators
const UsersValidator = require('./src/validator/users');

// Exceptions
const ClientError = require('./src/exceptions/ClientError');

const init = async () => {
  // 🔧 Inisialisasi Service
  const usersService = new UsersService();

  // 🚀 Membuat server instance
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'], // Boleh disesuaikan
      },
    },
  });

  // 🧩 Registrasi plugin JWT (nanti akan digunakan untuk auth)
  await server.register(Jwt);

  // ⚙️ Strategy auth JWT (belum digunakan untuk users)
  server.auth.strategy('maintenanceapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY || 'your_secret_key',
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: 3600,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // 🔌 Registrasi plugin lokal (users, dll)
  await server.register([
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
  ]);

  // 🧱 Penanganan error global
  server.ext('onPreResponse', (request, h) => {
    const response = request.response;

    if (response instanceof Error) {
      // Client Error (error yang dibuat manual)
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // Error dari hapi atau internal server
      if (!response.isServer) {
        return h.continue;
      }

      console.error(response); // log error server
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  // 🚀 Jalankan server
  await server.start();
  console.log(`✅ Server berjalan pada ${server.info.uri}`);
};

init();
