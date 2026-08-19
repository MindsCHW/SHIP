import api from './api';

export const surveyProcessingService = {
  async getPendingBatches() {
    const response = await api.get('/survey-processing/batches');
    return response.data;
  },

  async extractImages(project) {
    const response = await api.post(`/survey-processing/extract/${project}`);
    return response.data;
  }
};
