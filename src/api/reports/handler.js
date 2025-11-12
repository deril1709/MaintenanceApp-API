class ReportsHandler {
  constructor(service) {
    this._service = service;

    this.getReportsHandler = this.getReportsHandler.bind(this);
    this.getReportDetailHandler = this.getReportDetailHandler.bind(this);
    this.exportReportsHandler = this.exportReportsHandler.bind(this);
    this.getReportByTaskHandler = this.getReportByTaskHandler.bind(this);
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

  const { id: taskId } = request.params;
  const { buffer, filename } = await this._service.generateReportsPDF(taskId);

  return h
    .response(buffer)
    .header('Content-Type', 'application/pdf')
    .header('Content-Disposition', `attachment; filename="${filename}"`);
}

async getReportByTaskHandler(request, h) {
  const { id } = request.params; // ini adalah task_id
  const report = await this._service.getReportByTaskId(id);

  return h.response({
    status: 'success',
    data: { report },
  });
}



}

module.exports = ReportsHandler;
