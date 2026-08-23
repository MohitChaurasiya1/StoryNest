import api from './api';

export const getDashboardData = async () => {
  try {
    const response = await api.get('/teacher/dashboard/');
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      throw error.response.data.error;
    }
    throw new Error('Unable to load teacher dashboard.');
  }
};
