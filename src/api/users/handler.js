const AuthorizationError = require("../../exceptions/AuthorizationError");

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.postAdminUserHandler = this.postAdminUserHandler.bind(this);
    this.getUserTechniciansHandler = this.getUserTechniciansHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
  }

  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload);

    const { username, password, fullname } = request.payload;
    const userId = await this._service.addUser({
      username,
      password,
      fullname,
    });

    const response = h.response({
      status: "success",
      message: "User berhasil ditambahkan",
      data: { userId },
    });
    response.code(201);
    return response;
  }

  async postAdminUserHandler(request, h) {
    const role = request.auth?.credentials?.role;
    const isAnyAdmin = await this._service.findAdmin();
    if (!isAnyAdmin) {
      console.log("Belum ada admin, membuat admin pertama...");
    } else if (role !== "admin") {
      throw new AuthorizationError(
        "Anda tidak memiliki hak akses sebagai admin"
      );
    }

    this._validator.validateUserPayload(request.payload);
    const { username, password, fullname } = request.payload;

    const userId = await this._service.addUser({
      username,
      password,
      fullname,
      role: "admin",
    });

    const response = h.response({
      status: "success",
      message: "Admin berhasil ditambahkan",
      data: { userId },
    });
    response.code(201);
    return response;
  }
  async getUserTechniciansHandler(request){
    const userTechnicians = await this._service.getUserTechnicians();


    return {
      status: "success",
      data: { userTechnicians },
    }

    // const response =  h.response({
    //   status: "success",
    //   data: { userTechnicians },
    // })
    // response.code(200);

    // return response
  }

  async getUserByIdHandler(request, h) {
    const { id } = request.params;
    const user = await this._service.getUserById(id);
    return {
      status: "success",
      data: { user },
    };
  }
}

module.exports = UsersHandler;
