import api from './api';

export const reportService = {
  /**
   * Fetch distinct projects and their inspection cycles
   */
  async getConfig() {
    const response = await api.get('/reports/config');
    return response.data;
  },

  /**
   * Fetch high-level summary metrics for a project/cycle
   */
  async getSummary(project, cycleId) {
    const response = await api.get('/reports/summary', {
      params: { project, cycleId }
    });
    return response.data;
  },

  /**
   * Trigger the Excel download
   */
  async generateExcelReport(project, cycleId) {
    const response = await api.get('/reports/generate', {
      params: { project, cycleId },
      responseType: 'blob'
    });
    
    // Create a blob and download it
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `HiRATE_Report_${project}_${dateStr}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  }
};
