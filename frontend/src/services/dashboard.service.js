import api from './api';

export const dashboardService = {
  getUserKPIs: async () => {
    const response = await api.get('/dashboard/user-kpis');
    return response.data?.data || response.data;
  },

  getExecutiveKPIs: async () => {
    const response = await api.get('/dashboard/executive');
    return response.data?.data || response.data;
  },

  getProjectKPIs: async (projectId) => {
    const response = await api.get(`/dashboard/project/${projectId}`);
    return response.data?.data || response.data;
  },

  getRoadsStatus: async () => {
    const response = await api.get('/dashboard/roads-status');
    return response.data?.data || response.data;
  },

  getCategoryDistribution: async (projectId = '') => {
    const response = await api.get(`/dashboard/category-distribution?projectId=${projectId}`);
    return response.data?.data || response.data;
  },

  getDailyRatings: async (projectId = '', days = 30) => {
    const response = await api.get(`/dashboard/daily-ratings?projectId=${projectId}&days=${days}`);
    return response.data?.data || response.data;
  },

  getInspectorLeaderboard: async (projectId = '', limit = 10) => {
    const response = await api.get(`/dashboard/inspector-leaderboard?projectId=${projectId}&limit=${limit}`);
    return response.data?.data || response.data;
  },

  getRecentActivity: async (projectId = '', limit = 10) => {
    const response = await api.get(`/dashboard/recent-activity?projectId=${projectId}&limit=${limit}`);
    return response.data?.data || response.data;
  },

  getMapData: async (projectId = '') => {
    const response = await api.get(`/dashboard/map?projectId=${projectId}`);
    return response.data?.data || response.data;
  },

  getChartsData: async (projectId = '') => {
    const response = await api.get(`/dashboard/charts?projectId=${projectId}`);
    return response.data?.data || response.data;
  },

  getSkipAnalytics: async (projectId = '', filters = {}) => {
    let url = `/dashboard/skip-analytics?projectId=${projectId}`;
    if (filters.asset) url += `&assetType=${encodeURIComponent(filters.asset)}`;
    
    if (filters.time) {
      if (filters.time === 'jan-26') { url += `&startDate=2026-01-01&endDate=2026-01-31`; }
      else if (filters.time === 'feb-26') { url += `&startDate=2026-02-01&endDate=2026-02-28`; }
      else if (filters.time === 'jun-26') { url += `&startDate=2026-06-01&endDate=2026-06-30`; }
    }
    
    const response = await api.get(url);
    return response.data?.data || response.data;
  }
};
