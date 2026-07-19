import axios from 'axios';

const API_URL = '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Auth API
export const authAPI = {
  register: (name, email, password) =>
    axios.post(`${API_URL}/auth/register`, { name, email, password }),
  login: (email, password) =>
    axios.post(`${API_URL}/auth/login`, { email, password }),
  getCurrentUser: () =>
    axios.get(`${API_URL}/auth/me`, { headers: getAuthHeader() }),
};

// Topics API
export const topicsAPI = {
  getAll: (subjectId, status, topicType) => {
    let url = `${API_URL}/topics`;
    const params = [];
    if (subjectId) params.push(`subjectId=${subjectId}`);
    if (status) params.push(`status=${status}`);
    if (topicType) params.push(`topicType=${topicType}`);
    if (params.length) url += `?${params.join('&')}`;
    return axios.get(url, { headers: getAuthHeader() });
  },
  getOne: (id) =>
    axios.get(`${API_URL}/topics/${id}`, { headers: getAuthHeader() }),
  create: (data) =>
    axios.post(`${API_URL}/topics`, data, { headers: getAuthHeader() }),
  update: (id, data) =>
    axios.put(`${API_URL}/topics/${id}`, data, { headers: getAuthHeader() }),
  markAsRead: (id) =>
    axios.patch(`${API_URL}/topics/${id}/mark-read`, {}, { headers: getAuthHeader() }),
  markRevision: (id, revisionIndex) =>
    axios.patch(
      `${API_URL}/topics/${id}/revision/${revisionIndex}/complete`,
      {},
      { headers: getAuthHeader() }
    ),
  delete: (id) =>
    axios.delete(`${API_URL}/topics/${id}`, { headers: getAuthHeader() }),
  getTodayNotifications: () =>
    axios.get(`${API_URL}/topics/notifications/today`, { headers: getAuthHeader() }),
};

// Subjects API
export const subjectsAPI = {
  getAll: () =>
    axios.get(`${API_URL}/subjects`, { headers: getAuthHeader() }),
  create: (data) =>
    axios.post(`${API_URL}/subjects`, data, { headers: getAuthHeader() }),
  update: (id, data) =>
    axios.put(`${API_URL}/subjects/${id}`, data, { headers: getAuthHeader() }),
  delete: (id) =>
    axios.delete(`${API_URL}/subjects/${id}`, { headers: getAuthHeader() }),
};

// Notifications API
export const notificationsAPI = {
  getAll: (read) => {
    let url = `${API_URL}/notifications`;
    if (read !== undefined) url += `?read=${read}`;
    return axios.get(url, { headers: getAuthHeader() });
  },
  markAsRead: (id) =>
    axios.patch(`${API_URL}/notifications/${id}/read`, {}, { headers: getAuthHeader() }),
  getUnreadCount: () =>
    axios.get(`${API_URL}/notifications/count/unread`, { headers: getAuthHeader() }),
};
