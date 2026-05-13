import api from './axios';

// ─── Meals ────────────────────────────────────────────────────────────────────
export const mealAPI = {
  getAll: (params) => api.get('/meals', { params }),
  getSummary: (date) => api.get('/meals/summary', { params: { date } }),
  create: (data) => api.post('/meals', data),
  update: (id, d) => api.put(`/meals/${id}`, d),
  remove: (id) => api.delete(`/meals/${id}`),
  toggleFav: (id) => api.put(`/meals/${id}/favorite`),
};

// ─── Water ────────────────────────────────────────────────────────────────────
export const waterAPI = {
  getLogs: (date) => api.get('/water', { params: { date } }),
  add: (data) => api.post('/water', data),
  remove: (id) => api.delete(`/water/${id}`),
  updateGoal: (goal) => api.put('/water/goal', { goal }),
};

// ─── Weight ───────────────────────────────────────────────────────────────────
export const weightAPI = {
  getLogs: (params) => api.get('/weight', { params }),
  add: (data) => api.post('/weight', data),
  remove: (id) => api.delete(`/weight/${id}`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  get: (period) => api.get('/analytics', { params: { period } }),
  getDaily: (date) => api.get('/analytics/daily', { params: { date } }),
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiAPI = {
  chat: (message, history) => api.post('/ai/chat', { message, history }),
  getMealPlan: (data) => api.post('/ai/meal-plan', data),
  getDailyTip: () => api.get('/ai/daily-tip'),
  analyzeFood: (imageBase64, mimeType) => api.post('/ai/analyze-food', { imageBase64, mimeType }),
  getHistory: (params) => api.get('/ai/history', { params }),
};

// ─── Food search ──────────────────────────────────────────────────────────────
export const foodAPI = {
  search: (q, pageSize) => api.get('/food/search', { params: { q, pageSize } }),
  getById: (id) => api.get(`/food/${id}`),
  getSuggestions: () => api.get('/food/suggestions'),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleBlock: (id) => api.put(`/admin/users/${id}/block`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updatePlan: (id, plan, expiresAt) => api.put(`/admin/users/${id}/plan`, { plan, planExpiresAt: expiresAt }),
};

// ─── User ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  update: (data) => api.put('/users/profile', data),
  getStats: () => api.get('/users/stats'),
  uploadAvatar: (formData) => api.put('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
