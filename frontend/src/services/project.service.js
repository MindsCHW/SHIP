import api from './api';

export const projectService = {
  getAllProjects: () => api.get('/projects', { params: { limit: 1000 } }).then(r => r.data?.data || r.data),
  createProject: (data) => api.post('/projects', data).then(r => r.data?.data || r.data),
};
