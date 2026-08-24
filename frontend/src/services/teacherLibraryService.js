import api from './api';

const teacherLibraryService = {
  /**
   * Fetch a combined feed of library content (Stories, Lessons, Quizzes)
   * @param {Object} filters - filters like type, grade, search, created_by_me
   * @param {Number} page - pagination page
   * @returns {Promise<Object>} Object containing results array and pagination info
   */
  getContent: async (filters = {}, page = 1) => {
    try {
      const response = await api.get('/teacher/library/', {
        params: { ...filters, page }
      });
      return response.data; // { results: [], count: int, next: url, previous: url }
    } catch (error) {
      console.error('Error fetching library content:', error);
      throw error.response?.data?.error || new Error('Failed to fetch library content');
    }
  },

  getLibraryFeed: async (filters = {}, page = 1) => {
    return teacherLibraryService.getContent(filters, page);
  },

  /**
   * Fetch detailed preview data for a specific content type and ID
   * @param {String} type - 'story', 'lesson', or 'quiz'
   * @param {Number} id - Content ID
   * @returns {Promise<Object>} Detailed content data
   */
  getContentDetails: async (type, id) => {
    try {
      const response = await api.get(`/teacher/library/${type}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${type} details:`, error);
      throw error.response?.data?.error || new Error(`Failed to fetch ${type} details`);
    }
  }
};

export default teacherLibraryService;
