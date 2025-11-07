class AssetsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAssetHandler = this.postAssetHandler.bind(this);
    this.getAssetsHandler = this.getAssetsHandler.bind(this);
    this.getAssetByIdHandler = this.getAssetByIdHandler.bind(this);
    this.putAssetByIdHandler = this.putAssetByIdHandler.bind(this);
    this.deleteAssetByIdHandler = this.deleteAssetByIdHandler.bind(this);
  }

  async postAssetHandler(request, h) {
    this._validator.validateAssetPayload(request.payload);
    const { name, category, location } = request.payload;
    const assetId = await this._service.addAsset({ name, category, location });

    const response = h.response({
      status: 'success',
      message: 'Aset berhasil ditambahkan',
      data: { assetId },
    });
    response.code(201);
    return response;
  }

  async getAssetsHandler() {
    const assets = await this._service.getAssets();
    return {
      status: 'success',
      data: { assets },
    };
  }

  async getAssetByIdHandler(request) {
    const { id } = request.params;
    const asset = await this._service.getAssetById(id);
    return {
      status: 'success',
      data: { asset },
    };
  }

  async putAssetByIdHandler(request) {
    this._validator.validateAssetPayload(request.payload);
    const { id } = request.params;
    await this._service.editAssetById(id, request.payload);
    return {
      status: 'success',
      message: 'Aset berhasil diperbarui',
    };
  }

  async deleteAssetByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAssetById(id);
    return {
      status: 'success',
      message: 'Aset berhasil dihapus',
    };
  }
}

module.exports = AssetsHandler;
