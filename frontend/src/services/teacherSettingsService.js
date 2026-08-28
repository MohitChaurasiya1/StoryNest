import api from './api';

const teacherSettingsService = {
  getSettings: async () => {
    const response = await api.get('/teacher/settings/all/');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/teacher/settings/profile/');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch('/teacher/settings/profile/', data);
    return response.data;
  },

  getPreferences: async () => {
    const response = await api.get('/teacher/settings/preferences/');
    return response.data;
  },

  updatePreferences: async (data) => {
    const response = await api.patch('/teacher/settings/preferences/', data);
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('/teacher/settings/notifications/');
    return response.data;
  },

  updateNotifications: async (data) => {
    const response = await api.patch('/teacher/settings/notifications/', data);
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword
    });
    return response.data;
  }
};

export default teacherSettingsService;
