import api from './api';

const teacherAssignmentService = {
  getAssignments: async (filters = {}) => {
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const params = new URLSearchParams(cleanedFilters).toString();
    const response = await api.get(`/teacher/assignments/${params ? `?${params}` : ''}`);
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

  getRecipients: async (id, filters = {}) => {
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const params = new URLSearchParams(cleanedFilters).toString();
    const response = await api.get(`/teacher/assignments/${id}/recipients/${params ? `?${params}` : ''}`);
    return response.data.results || response.data;
  },

  getStudentAssignments: async (studentId, classroomId = null) => {
    const url = classroomId
      ? `/teacher/classrooms/${classroomId}/students/${studentId}/assignments/`
      : `/teacher/students/${studentId}/assignments/`;
    const response = await api.get(url);
    return response.data;
  }
};

export default teacherAssignmentService;
