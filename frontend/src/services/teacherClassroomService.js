import api from "./api";

const teacherClassroomService = {
  /**
   * Get all classrooms for the authenticated teacher.
   * @param {Object} params - Query parameters (e.g., { status: 'active' })
   */
  getClassrooms: async (params = { status: "active" }) => {
    try {
      const response = await api.get("/teacher/classrooms/", { params });
      return response.data.results;
    } catch (error) {
      throw error.response?.data?.error || new Error("Failed to fetch classrooms");
    }
  },

  /**
   * Get a specific classroom by ID.
   */
  getClassroom: async (id) => {
    try {
      const response = await api.get(`/teacher/classrooms/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || new Error("Failed to fetch classroom");
    }
  },

  /**
   * Create a new classroom.
   */
  createClassroom: async (data) => {
    try {
      const response = await api.post("/teacher/classrooms/", data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || new Error("Failed to create classroom");
    }
  },

  /**
   * Update an existing classroom.
   */
  updateClassroom: async (id, data) => {
    try {
      const response = await api.patch(`/teacher/classrooms/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || new Error("Failed to update classroom");
    }
  },

  /**
   * Archive a classroom.
   */
  archiveClassroom: async (id) => {
    try {
      const response = await api.post(`/teacher/classrooms/${id}/archive/`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || new Error("Failed to archive classroom");
    }
  },

  /**
   * Get all active students in a classroom.
   */
  getStudents: async (classroomId, params = {}) => {
    try {
      const response = await api.get(`/teacher/classrooms/${classroomId}/students/`, { params });
      return response.data.results;
    } catch (error) {
      throw error.response?.data?.error || new Error("Failed to fetch students");
    }
  },

  /**
   * Add multiple students to a classroom.
   */
  addStudents: async (classroomId, studentIds) => {
    try {
      const response = await api.post(`/teacher/classrooms/${classroomId}/students/`, {
        student_ids: studentIds,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || new Error("Failed to add students");
    }
  },

  /**
   * Remove a student from a classroom.
   */
  removeStudent: async (classroomId, studentId) => {
    try {
      const response = await api.delete(`/teacher/classrooms/${classroomId}/students/${studentId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || new Error("Failed to remove student");
    }
  },

  /**
   * Get an individual student's summary.
   */
  getStudentSummary: async (classroomId, studentId) => {
    try {
      const response = await api.get(`/teacher/classrooms/${classroomId}/students/${studentId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || new Error("Failed to fetch student summary");
    }
  },

  /**
   * Search globally for students to add.
   */
  searchStudents: async (query) => {
    try {
      const response = await api.get("/teacher/students/search/", { params: { search: query } });
      return response.data.results;
    } catch (error) {
      throw error.response?.data?.error || new Error("Failed to search students");
    }
  },
};

export default teacherClassroomService;
