import api from './api';

const teacherProgressService = {
  getOverview: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/teacher/progress/overview/?${params}`);
    return response.data;
  },

  getReadingAnalytics: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/teacher/progress/reading/?${params}`);
    return response.data;
  },

  getQuizAnalytics: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/teacher/progress/quizzes/?${params}`);
    return response.data;
  },

  getAssignmentAnalytics: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/teacher/progress/assignments/?${params}`);
    return response.data;
  },

  getNeedsAttention: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/teacher/progress/attention/?${params}`);
    return response.data;
  },

  getStudentPerformanceList: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/teacher/progress/students/?${params}`);
    return response.data.results || response.data;
  },

  getStudentDetailProgress: async (studentId, filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/teacher/progress/students/${studentId}/?${params}`);
    return response.data;
  },

  exportReport: async (classroomId = null) => {
    const query = classroomId ? `?classroom_id=${classroomId}` : '';
    const response = await api.get(`/teacher/progress/export/${query}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default teacherProgressService;
