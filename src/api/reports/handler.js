class ReportsHandler {
  constructor(service) {
    this._service = service;

    this.getReportsHandler = this.getReportsHandler.bind(this);
    this.getReportDetailHandler = this.getReportDetailHandler.bind(this);
    this.exportReportsHandler = this.exportReportsHandler.bind(this);
  }

  async getReportsHandler(request, h) {
    const { role } = request.auth.credentials;
    if (role !== 'admin') {
      return h.response({
        status: 'fail',
        message: 'Hanya admin yang dapat mengakses laporan.',
      }).code(403);
    }

    const reports = await this._service.getReports();
    return {
      status: 'success',
      data: { reports },
    };
  }

  async getReportDetailHandler(request, h) {
    const { role } = request.auth.credentials;
    if (role !== 'admin') {
      return h.response({
        status: 'fail',
        message: 'Hanya admin yang dapat mengakses detail laporan.',
      }).code(403);
    }

    const { id } = request.params;
    const report = await this._service.getReportById(id);

    if (!report) {
      return h.response({
        status: 'fail',
        message: 'Laporan tidak ditemukan',
      }).code(404);
    }

    return {
      status: 'success',
      data: { report },
    };
  }

async exportReportsHandler(request, h) {
  const { role } = request.auth.credentials;
  if (role !== 'admin') {
    return h.response({
      status: 'fail',
      message: 'Hanya admin yang dapat mengunduh laporan.',
    }).code(403);
  }

  const { id } = request.params; // pastikan endpoint-nya pakai /reports/{id}/export
  const { buffer, filename } = await this._service.generateReportsPDF(id);

  return h
    .response(buffer)
    .type('application/pdf') // lebih aman daripada header manual
    .header('Content-Disposition', `attachment; filename="${filename}"`)
    .encoding('binary'); // pastikan dikirim sebagai biner
}



}

module.exports = ReportsHandler;
