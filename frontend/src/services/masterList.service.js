import api from './api';

export const masterListService = {
  async getMasterList(filters = {}) {
    const response = await api.get('/master', { params: filters });
    return response.data;
  },

  async getProjects() {
    const response = await api.get('/master/projects');
    return response.data;
  },

  async getCategories(project) {
    const params = {};
    if (project) params.project = project;
    const response = await api.get('/master/categories', { params });
    return response.data;
  },

  async getAssetTypes(project, categories) {
    const params = {};
    if (project) params.project = project;
    if (categories && categories.length > 0) params.categories = categories;
    const response = await api.get('/master/assets', { params });
    return response.data;
  },

  async getRoadTypes(project) {
    const response = await api.get('/master/road-types', { params: { project } });
    return response.data;
  },

  async getParameters() {
    const response = await api.get('/master/parameters');
    return response.data;
  },

  async getChainages() {
    const response = await api.get('/master/chainages');
    return response.data;
  },

  async getStats() {
    const response = await api.get('/master/stats');
    return response.data;
  },

  async importMasterList(formData) {
    const response = await api.post('/master/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async updateMasterListItem(id, updateData) {
    const response = await api.put(`/master/${id}`, updateData);
    return response.data;
  },

  async deleteMasterListItem(id) {
    const response = await api.delete(`/master/${id}`);
    return response.data;
  },

  async deleteProjectMasterList(projectName) {
    const response = await api.delete(`/master/project/${encodeURIComponent(projectName)}`);
    return response.data;
  }
};
