class MaintenancesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    
    this.postMaintenanceHandler = this.postMaintenanceHandler.bind(this);
    this.getMaintenancesHandler = this.getMaintenancesHandler.bind(this);
  }

  async postMaintenanceHandler(request, h) {
    this._validator.validateMaintenancePayload(request.payload);
    const { asset_id, description, frequency_days } = request.payload;

    const maintenanceId = await this._service.addMaintenance({ asset_id, description, frequency_days });

    const response = h.response({
      status: 'success',
      message: 'Jadwal maintenance berhasil dibuat',
      data: { maintenanceId },
    });
    response.code(201);
    return response;
  }

  async getMaintenancesHandler() {
    const maintenances = await this._service.getMaintenances();
    return {
      status: 'success',
      data: { maintenances },
    };
  }
}

module.exports = MaintenancesHandler;