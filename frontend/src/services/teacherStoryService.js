import api from "./api";

const teacherStoryService = {
  /**
   * Request AI story draft generation with structured pages.
   */
  generateStory: async (params) => {
    try {
      const response = await api.post("/teacher/stories/generate/", params, { timeout: 600000 });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || new Error(error.response?.data?.details || "Failed to generate AI story");
    }
  },

  /**
   * Create a new story draft or manual story.
   */
  createStory: async (data) => {
    try {
      const response = await api.post("/teacher/stories/", data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || new Error("Failed to save story");
    }
  },

  /**
   * Fetch a teacher story by ID.
   */
  getStory: async (id) => {
    try {
      const response = await api.get(`/teacher/stories/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || new Error("Failed to load story");
    }
  },

  /**
   * Update an existing teacher story and pages.
   */
  updateStory: async (id, data) => {
    try {
      const response = await api.patch(`/teacher/stories/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || new Error("Failed to update story");
    }
  },

  /**
   * Publish story to My Library, Classroom, or Specific Students.
   */
  publishStory: async (id, data) => {
    try {
      const response = await api.post(`/teacher/stories/${id}/publish/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || new Error("Failed to publish story");
    }
  }
};

export default teacherStoryService;
