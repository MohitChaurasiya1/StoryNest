import api from './api';

const teacherAssignmentService = {
  getAssignments: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/teacher/assignments/?${params}`);
    return response.data.results || response.data;
  },

  getAssignment: async (id) => {
    const response = await api.get(`/teacher/assignments/${id}/`);
    return response.data;
  },

  createAssignment: async (data) => {
    const response = await api.post('/teacher/assignments/', data);
    return response.data;
  },

  updateAssignment: async (id, data) => {
    const response = await api.patch(`/teacher/assignments/${id}/`, data);
    return response.data;
  },

  publishAssignment: async (id, data = {}) => {
    const response = await api.post(`/teacher/assignments/${id}/publish/`, data);
    return response.data;
  },

  archiveAssignment: async (id) => {
    const response = await api.post(`/teacher/assignments/${id}/archive/`);
    return response.data;
  },

  duplicateAssignment: async (id) => {
    const response = await api.post(`/teacher/assignments/${id}/duplicate/`);
    return response.data;
  },

  getRecipients: async (id) => {
    const response = await api.get(`/teacher/assignments/${id}/recipients/`);
    return response.data.results || response.data;
  }
};

export default teacherAssignmentService;
