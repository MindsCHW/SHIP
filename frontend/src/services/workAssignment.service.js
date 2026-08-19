import api from './api';

export const workAssignmentService = {
  // ── Assignments ──────────────────────────────────────────────────────────────
  getAll: (params = {}) =>
    api.get('/work-assignments', { params }).then(r => r.data?.data || r.data),

  getMine: () =>
    api.get('/work-assignments/my').then(r => r.data?.data || r.data),

  create: (data) =>
    api.post('/work-assignments', data).then(r => r.data?.data || r.data),

  bulkCreate: (data) =>
    api.post('/work-assignments/bulk', data).then(r => r.data?.data || r.data),

  edit: (id, data) =>
    api.put(`/work-assignments/${id}`, data).then(r => r.data?.data || r.data),

  updateStatus: (id, status) =>
    api.put(`/work-assignments/${id}/status`, { status }).then(r => r.data?.data || r.data),

  deleteAssignment: (id) =>
    api.delete(`/work-assignments/${id}`).then(r => r.data),

  getTimeline: (id) =>
    api.get(`/work-assignments/${id}/timeline`).then(r => r.data?.data || r.data),

  getStats: (project = '') =>
    api.get('/work-assignments/stats', { params: { project } }).then(r => r.data?.data || r.data),

  // ── Batches ──────────────────────────────────────────────────────────────────
  getBatchesReady: (project = '') =>
    api.get('/work-assignments/batches-ready', { params: { project } }).then(r => r.data?.data || r.data),

  // ── Users ────────────────────────────────────────────────────────────────────
  getUsers: (params = {}) =>
    api.get('/users', { params: { ...params, limit: 200 } }).then(r => r.data?.data || r.data),

  getUserStats: () =>
    api.get('/users/stats').then(r => r.data?.data || r.data),

  createUser: (data) =>
    api.post('/users', data).then(r => r.data?.data || r.data),

  updateUser: (id, data) =>
    api.put(`/users/${id}`, data).then(r => r.data?.data || r.data),

  toggleUserStatus: (id) =>
    api.put(`/users/${id}/status`).then(r => r.data?.data || r.data),

  deleteUser: (id) =>
    api.delete(`/users/${id}`).then(r => r.data),

  // ── Notifications ────────────────────────────────────────────────────────────
  getNotifications: (params = {}) =>
    api.get('/notifications', { params }).then(r => r.data?.data || r.data),

  markRead: (id) =>
    api.put(`/notifications/${id}/read`).then(r => r.data),

  markAllRead: () =>
    api.put('/notifications/read-all').then(r => r.data),
};
