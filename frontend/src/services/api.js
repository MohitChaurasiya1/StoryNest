import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('storynest_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('storynest_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem('storynest_access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('storynest_access_token');
          localStorage.removeItem('storynest_refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authApi = {
  login: async (username, password) => {
    const res = await api.post('/auth/token/', { username, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register/', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me/');
    return res.data;
  },
};

// Parent Module Services
export const parentApi = {
  // Children Profiles
  getChildren: async () => {
    const res = await api.get('/parent/children/');
    return res.data;
  },
  createChild: async (childData) => {
    const res = await api.post('/parent/children/', childData);
    return res.data;
  },
  updateChild: async (id, childData) => {
    const res = await api.put(`/parent/children/${id}/`, childData);
    return res.data;
  },
  deleteChild: async (id) => {
    const res = await api.delete(`/parent/children/${id}/`);
    return res.data;
  },

  // Child Dashboard & Insights
  getDashboard: async (childId) => {
    const res = await api.get(`/parent/children/${childId}/dashboard/`);
    return res.data;
  },
  getInsights: async (childId) => {
    const res = await api.get(`/parent/children/${childId}/insights/`);
    return res.data;
  },

  // Reading Logs
  getReadingLogs: async (childId) => {
    const res = await api.get(`/parent/children/${childId}/reading-logs/`);
    return res.data;
  },
  createReadingLog: async (childId, logData) => {
    const res = await api.post(`/parent/children/${childId}/reading-logs/`, logData);
    return res.data;
  },
  deleteReadingLog: async (childId, logId) => {
    const res = await api.delete(`/parent/children/${childId}/reading-logs/${logId}/`);
    return res.data;
  },

  // Stories
  getChildStories: async (childId) => {
    const res = await api.get(`/parent/children/${childId}/stories/`);
    return res.data;
  },

  // Achievements
  getAchievements: async (childId) => {
    const res = await api.get(`/parent/children/${childId}/achievements/`);
    return res.data;
  },
};

export default api;
