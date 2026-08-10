import api from './api';

export const shipService = {
  getOverview: () => api.get('/ship/overview').then(res => res.data?.data || res.data),
  getProjects: () => api.get('/ship/projects').then(res => res.data?.data || res.data),
  getProjectDetails: (id) => api.get(`/ship/projects/${id}`).then(res => res.data?.data || res.data),
  getRelationshipIntelligence: (projectCode) => api.get(`/ship/relationship?project=${encodeURIComponent(projectCode)}`).then(res => res.data?.data || res.data),
  getSpatialIntelligence: (projectCode) => api.get(`/ship/spatial?project=${encodeURIComponent(projectCode)}`).then(res => res.data?.data || res.data),
  getTemporalIntelligence: (projectCode) => api.get(`/ship/temporal?project=${encodeURIComponent(projectCode)}`).then(res => res.data?.data || res.data),
  getDecisionIntelligence: (projectCode) => api.get(`/ship/decision?project=${encodeURIComponent(projectCode)}`).then(res => res.data?.data || res.data),
};
