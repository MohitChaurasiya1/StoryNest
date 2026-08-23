import axios from "axios";

/*
|--------------------------------------------------------------------------
| API Configuration
|--------------------------------------------------------------------------
|
| Add this to frontend/.env:
|
| VITE_API_BASE_URL=http://localhost:8000/api
|
| Restart the Vite server after changing environment variables.
|
*/

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (!envUrl) return "http://127.0.0.1:8000/api";
  const cleaned = envUrl.trim().replace(/\/+$/, "");
  return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
};

const API_BASE_URL = getBaseUrl();

const AUTH_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/*
|--------------------------------------------------------------------------
| Token Helpers
|--------------------------------------------------------------------------
*/

export const tokenService = {
  getAccessToken() {
    return (
      localStorage.getItem(AUTH_TOKEN_KEY) ||
      localStorage.getItem("storynest_access_token") ||
      localStorage.getItem("access_token")
    );
  },

  getRefreshToken() {
    return (
      localStorage.getItem(REFRESH_TOKEN_KEY) ||
      localStorage.getItem("storynest_refresh_token") ||
      localStorage.getItem("refresh_token")
    );
  },

  setTokens({ access, refresh }) {
    if (access) {
      localStorage.setItem(AUTH_TOKEN_KEY, access);
      localStorage.setItem("storynest_access_token", access);
      localStorage.setItem("access_token", access);
    }
    if (refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
      localStorage.setItem("storynest_refresh_token", refresh);
      localStorage.setItem("refresh_token", refresh);
    }
  },

  setAccessToken(accessToken) {
    if (accessToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      localStorage.setItem("storynest_access_token", accessToken);
      localStorage.setItem("access_token", accessToken);
    }
  },

  clearTokens() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem("storynest_access_token");
    localStorage.removeItem("storynest_refresh_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  hasAccessToken() {
    return Boolean(this.getAccessToken());
  },
};

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    const accessToken = tokenService.getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    /*
     * Do not manually set multipart/form-data content type.
     * Axios will automatically add the correct boundary.
     */
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
|--------------------------------------------------------------------------
| Refresh Token Handling
|--------------------------------------------------------------------------
*/

let isRefreshingToken = false;
let refreshSubscribers = [];

const subscribeToTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const notifyRefreshSubscribers = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};

const rejectRefreshSubscribers = (error) => {
  refreshSubscribers.forEach((callback) => callback(null, error));
  refreshSubscribers = [];
};

const refreshAccessToken = async () => {
  const refreshToken = tokenService.getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token is available.");
  }

  /*
   * Change this endpoint if your Simple JWT refresh URL is different.
   * Expected default endpoint:
   * POST /api/token/refresh/
   */
  const response = await axios.post(
    `${API_BASE_URL}/auth/token/refresh/`,
    {
      refresh: refreshToken,
    },
    {
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  const newAccessToken = response.data?.access;

  if (!newAccessToken) {
    throw new Error("The refresh endpoint did not return an access token.");
  }

  tokenService.setAccessToken(newAccessToken);

  if (response.data?.refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refresh);
  }

  return newAccessToken;
};

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    const isUnauthorized = status === 401;
    const isRefreshRequest =
      originalRequest?.url?.includes("/token/refresh/");

    if (
      !isUnauthorized ||
      !originalRequest ||
      originalRequest._retry ||
      isRefreshRequest
    ) {
      return Promise.reject(error);
    }

    const refreshToken = tokenService.getRefreshToken();

    if (!refreshToken) {
      tokenService.clearTokens();
      return Promise.reject(error);
    }

    if (isRefreshingToken) {
      return new Promise((resolve, reject) => {
        subscribeToTokenRefresh((newAccessToken, refreshError) => {
          if (refreshError || !newAccessToken) {
            reject(refreshError || error);
            return;
          }

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshingToken = true;

    try {
      const newAccessToken = await refreshAccessToken();

      notifyRefreshSubscribers(newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      rejectRefreshSubscribers(refreshError);
      tokenService.clearTokens();

      /*
       * Prevent redirect loops while already on an authentication page.
       */
      const currentPath = window.location.pathname;
      const isAuthPage =
        currentPath.includes("/login") ||
        currentPath.includes("/register") ||
        currentPath.includes("/forgot-password");

      if (!isAuthPage) {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshingToken = false;
    }
  }
);

/*
|--------------------------------------------------------------------------
| Response and Error Helpers
|--------------------------------------------------------------------------
*/

const unwrapResponse = (response) => response.data;

export const getApiErrorMessage = (
  error,
  fallbackMessage = "Something went wrong. Please try again."
) => {
  if (!error) {
    return fallbackMessage;
  }

  if (error.code === "ECONNABORTED") {
    return "The request took too long. Please try again.";
  }

  if (!error.response) {
    if (error.isAxiosError || error.request) {
      return "Unable to connect to the server. Please check your internet connection.";
    }
    return error.message || fallbackMessage;
  }

  const responseData = error.response.data;

  if (typeof responseData === "string") {
    return responseData;
  }

  if (responseData?.detail) {
    return responseData.detail;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.error) {
    return responseData.error;
  }

  if (responseData && typeof responseData === "object") {
    const firstErrorValue = Object.values(responseData)[0];

    if (Array.isArray(firstErrorValue)) {
      return firstErrorValue[0];
    }

    if (typeof firstErrorValue === "string") {
      return firstErrorValue;
    }
  }

  return fallbackMessage;
};

export const buildQueryParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );

const toFormData = (payload = {}) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        formData.append(key, item);
      });
      return;
    }

    if (
      typeof value === "object" &&
      !(value instanceof File) &&
      !(value instanceof Blob)
    ) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, value);
  });

  return formData;
};

/*
|--------------------------------------------------------------------------
| General Authentication API
|--------------------------------------------------------------------------
|
| Update these URLs if your existing authentication endpoints use
| different paths.
|
*/

export const authApi = {
  async login(usernameOrPayload, password) {
    const payload =
      typeof usernameOrPayload === "object"
        ? usernameOrPayload
        : { username: usernameOrPayload, password };

    const response = await api.post("/auth/token/", payload);

    if (response.data?.access) {
      tokenService.setTokens({
        access: response.data.access,
        refresh: response.data.refresh,
      });
    }

    return unwrapResponse(response);
  },

  async register(payload) {
    const response = await api.post("/auth/register/", payload);
    return unwrapResponse(response);
  },

  async getMe() {
    const response = await api.get("/auth/me/");
    return unwrapResponse(response);
  },

  async refreshToken() {
    const accessToken = await refreshAccessToken();

    return {
      access: accessToken,
    };
  },

  async forgotPassword(email) {
    const response = await api.post("/auth/forgot-password/", { email });
    return unwrapResponse(response);
  },

  async resetPassword(payload) {
    const response = await api.post("/auth/reset-password/", payload);
    return unwrapResponse(response);
  },

  async changePassword(payload) {
    const response = await api.post("/auth/change-password/", payload);
    return unwrapResponse(response);
  },

  async updateProfile(payload) {
    const response = await api.patch("/auth/update-profile/", payload);
    return unwrapResponse(response);
  },

  async deleteAccount(payload = {}) {
    const response = await api.delete("/auth/delete-account/", { data: payload });
    tokenService.clearTokens();
    return unwrapResponse(response);
  },

  logout() {
    tokenService.clearTokens();
  },
};

/*
|--------------------------------------------------------------------------
| Parent Authentication and Account Settings
|--------------------------------------------------------------------------
*/

export const parentAuthApi = {
  async changePassword(payload) {
    const response = await api.post(
      "/parent/auth/change-password/",
      payload
    );

    return unwrapResponse(response);
  },

  async updateProfile(payload, options = {}) {
    const { useFormData = false } = options;

    const requestPayload = useFormData
      ? toFormData(payload)
      : payload;

    const response = await api.patch(
      "/parent/auth/update-profile/",
      requestPayload
    );

    return unwrapResponse(response);
  },

  async deleteAccount(payload = {}) {
    const response = await api.delete(
      "/parent/auth/delete-account/",
      {
        data: payload,
      }
    );

    tokenService.clearTokens();

    return unwrapResponse(response);
  },
};

/*
|--------------------------------------------------------------------------
| Parent Profile API
|--------------------------------------------------------------------------
*/

export const parentProfileApi = {
  async getProfile() {
    const response = await api.get("/parent/profile/");
    return unwrapResponse(response);
  },

  async updateProfile(payload) {
    const response = await api.patch(
      "/parent/profile/",
      payload
    );

    return unwrapResponse(response);
  },

  async replaceProfile(payload) {
    const response = await api.put(
      "/parent/profile/",
      payload
    );

    return unwrapResponse(response);
  },

  async updatePreferences(preferences) {
    const response = await api.patch(
      "/parent/profile/",
      preferences
    );

    return unwrapResponse(response);
  },

  async getSettings() {
    const response = await api.get("/parent/profile/");
    return unwrapResponse(response);
  },

  async updateSettings(settings) {
    const response = await api.patch("/parent/profile/", settings);
    return unwrapResponse(response);
  },

  async deleteAccount(payload = {}) {
    return parentAuthApi.deleteAccount(payload);
  },
};

/*
|--------------------------------------------------------------------------
| Parent Dashboard API
|--------------------------------------------------------------------------
*/

export const parentDashboardApi = {
  async getDashboard() {
    const response = await api.get("/parent/dashboard/");
    return unwrapResponse(response);
  },

  async getChildDashboard(childId) {
    const response = await api.get(
      `/parent/children/${childId}/dashboard/`
    );

    return unwrapResponse(response);
  },

  async getChildInsights(childId, params = {}) {
    const response = await api.get(
      `/parent/children/${childId}/insights/`,
      {
        params: buildQueryParams(params),
      }
    );

    return unwrapResponse(response);
  },
};

/*
|--------------------------------------------------------------------------
| Children CRUD API
|--------------------------------------------------------------------------
*/

const sanitizeChildPayload = (payload) => {
  if (!payload || payload instanceof FormData) return payload;
  const cleaned = { ...payload };
  if (cleaned.dob === "" || cleaned.dob === undefined) {
    cleaned.dob = null;
  }
  return cleaned;
};

export const parentChildrenApi = {
  async getChildren(params = {}) {
    const response = await api.get("/parent/children/", {
      params: buildQueryParams(params),
    });

    return unwrapResponse(response);
  },

  async getChild(childId) {
    const response = await api.get(
      `/parent/children/${childId}/`
    );

    return unwrapResponse(response);
  },

  async createChild(payload) {
    const cleanedPayload = sanitizeChildPayload(payload);
    const hasFile = cleanedPayload?.avatar instanceof File || cleanedPayload?.avatar instanceof Blob;
    const requestPayload = hasFile ? toFormData(cleanedPayload) : cleanedPayload;

    const response = await api.post(
      "/parent/children/",
      requestPayload
    );

    return unwrapResponse(response);
  },

  async updateChild(childId, payload) {
    const cleanedPayload = sanitizeChildPayload(payload);
    const hasFile = cleanedPayload?.avatar instanceof File || cleanedPayload?.avatar instanceof Blob;
    const requestPayload = hasFile ? toFormData(cleanedPayload) : cleanedPayload;

    const response = await api.patch(
      `/parent/children/${childId}/`,
      requestPayload
    );

    return unwrapResponse(response);
  },

  async replaceChild(childId, payload) {
    const cleanedPayload = sanitizeChildPayload(payload);
    const hasFile = cleanedPayload?.avatar instanceof File || cleanedPayload?.avatar instanceof Blob;
    const requestPayload = hasFile ? toFormData(cleanedPayload) : cleanedPayload;

    const response = await api.put(
      `/parent/children/${childId}/`,
      requestPayload
    );

    return unwrapResponse(response);
  },

  async deleteChild(childId) {
    const response = await api.delete(
      `/parent/children/${childId}/`
    );

    return unwrapResponse(response);
  },
};

/*
|--------------------------------------------------------------------------
| Parent Story Library API
|--------------------------------------------------------------------------
*/

export const parentLibraryApi = {
  async getLibrary(params = {}) {
    const response = await api.get("/parent/library/", {
      params: buildQueryParams(params),
    });

    return unwrapResponse(response);
  },

  async getChildStories(childId, params = {}) {
    const response = await api.get(
      `/parent/children/${childId}/stories/`,
      {
        params: buildQueryParams(params),
      }
    );

    return unwrapResponse(response);
  },

  async getStory(storyId) {
    const response = await api.get(`/stories/${storyId}/`);
    return unwrapResponse(response);
  },

  async toggleFavourite(storyId, payload = {}) {
    const response = await api.post(
      `/parent/stories/${storyId}/favourite/`,
      payload
    );

    return unwrapResponse(response);
  },

  async addFavourite(storyId) {
    const response = await api.post(
      `/parent/stories/${storyId}/favourite/`,
      {
        is_favourite: true,
      }
    );

    return unwrapResponse(response);
  },

  async removeFavourite(storyId) {
    const response = await api.delete(
      `/parent/stories/${storyId}/favourite/`
    );

    return unwrapResponse(response);
  },
};

/*
|--------------------------------------------------------------------------
| Reading Progress API
|--------------------------------------------------------------------------
*/

export const parentProgressApi = {
  async getProgress(params = {}) {
    try {
      const response = await api.get("/parent/dashboard/", {
        params: buildQueryParams(params),
      });
      return unwrapResponse(response);
    } catch {
      return {};
    }
  },

  async getReadingHistory(params = {}) {
    try {
      if (params.child && params.child !== "all") {
        const response = await api.get(
          `/parent/children/${params.child}/reading-logs/`,
          { params: buildQueryParams(params) }
        );
        return unwrapResponse(response);
      }
      const response = await api.get("/parent/family-logs/", {
        params: buildQueryParams(params),
      });
      return unwrapResponse(response);
    } catch {
      return [];
    }
  },

  async getStoryProgress(childId, storyId) {
    const response = await api.get(
      `/parent/children/${childId}/progress/${storyId}/`
    );

    return unwrapResponse(response);
  },

  async updateStoryProgress(childId, storyId, payload) {
    const response = await api.patch(
      `/parent/children/${childId}/progress/${storyId}/`,
      payload
    );

    return unwrapResponse(response);
  },

  async replaceStoryProgress(childId, storyId, payload) {
    const response = await api.put(
      `/parent/children/${childId}/progress/${storyId}/`,
      payload
    );

    return unwrapResponse(response);
  },

  async createReadingSession(childId, storyId, payload) {
    const response = await api.post(
      `/parent/children/${childId}/progress/${storyId}/`,
      payload
    );

    return unwrapResponse(response);
  },
};

/*
|--------------------------------------------------------------------------
| Quiz API
|--------------------------------------------------------------------------
*/

export const parentQuizApi = {
  async getStoryQuiz(storyId) {
    const response = await api.get(
      `/parent/stories/${storyId}/quiz/`
    );

    return unwrapResponse(response);
  },

  async submitStoryQuiz(storyId, payload) {
    const response = await api.post(
      `/parent/stories/${storyId}/quiz/submit/`,
      payload
    );

    return unwrapResponse(response);
  },

  async getChildQuizHistory(childId, params = {}) {
    const response = await api.get(
      `/parent/children/${childId}/quizzes/history/`,
      {
        params: buildQueryParams(params),
      }
    );

    return unwrapResponse(response);
  },

  async getQuizReports(params = {}) {
    try {
      if (params.child && params.child !== "all") {
        return await this.getChildQuizHistory(params.child, params);
      }

      const children = await parentChildrenApi.getChildren();
      const childList = Array.isArray(children)
        ? children
        : children?.results || children?.children || children?.data || [];

      if (!childList.length) return [];

      const allQuizzes = await Promise.all(
        childList.map(async (child) => {
          try {
            const data = await this.getChildQuizHistory(child.id, params);
            const list = Array.isArray(data)
              ? data
              : data?.results || data?.history || [];
            return list.map((q) => ({
              ...q,
              child_name: q.child_name || child.name,
              child_id: child.id,
            }));
          } catch {
            return [];
          }
        })
      );

      return allQuizzes.flat();
    } catch {
      return [];
    }
  },

  async getQuizSummary(params = {}) {
    try {
      const reports = await this.getQuizReports(params);
      const list = Array.isArray(reports) ? reports : [];

      const totalAttempts = list.length;
      const averageScore = totalAttempts
        ? Math.round(
            list.reduce(
              (acc, q) => acc + Number(q.percentage || q.score || 0),
              0
            ) / totalAttempts
          )
        : 0;

      const perfectScores = list.filter(
        (q) => Number(q.percentage || q.score || 0) >= 100
      ).length;

      return {
        total_quizzes: totalAttempts,
        average_score: averageScore,
        perfect_scores: perfectScores,
      };
    } catch {
      return {};
    }
  },
};

/*
|--------------------------------------------------------------------------
| Achievements API
|--------------------------------------------------------------------------
*/

export const parentAchievementsApi = {
  async getChildAchievements(childId, params = {}) {
    const response = await api.get(
      `/parent/children/${childId}/achievements/`,
      {
        params: buildQueryParams(params),
      }
    );

    return unwrapResponse(response);
  },

  async getAchievements(params = {}) {
    try {
      if (params.child && params.child !== "all") {
        return await this.getChildAchievements(params.child, params);
      }

      // If all children selected or no child specified, fetch for all children
      const children = await parentChildrenApi.getChildren();
      const childList = Array.isArray(children)
        ? children
        : children?.results || children?.children || children?.data || [];

      if (!childList.length) return [];

      const allAchievements = await Promise.all(
        childList.map(async (child) => {
          try {
            const certs = await this.getChildAchievements(child.id, params);
            const list = Array.isArray(certs)
              ? certs
              : certs?.results || certs?.achievements || certs?.data || [];

            return list.map((a) => ({
              ...a,
              child_name: a.child_name || child.name,
              child_id: child.id,
            }));
          } catch {
            return [];
          }
        })
      );

      return allAchievements.flat();
    } catch {
      return [];
    }
  },

  async getAchievementSummary(params = {}) {
    try {
      const achievements = await this.getAchievements(params);
      const list = Array.isArray(achievements) ? achievements : [];

      const unlocked = list.filter((a) => a.unlocked || a.is_unlocked || a.earned);
      const locked = list.filter((a) => !a.unlocked && !a.is_unlocked && !a.earned);

      return {
        unlocked_count: unlocked.length,
        locked_count: locked.length,
        total_points: unlocked.reduce((acc, curr) => acc + Number(curr.points || 0), 0),
        almost_completed_count: list.filter((a) => !a.unlocked && (a.progress || 0) >= 70).length,
      };
    } catch {
      return {};
    }
  },
};

/*
|--------------------------------------------------------------------------
| Certificates API
|--------------------------------------------------------------------------
*/

export const parentCertificatesApi = {
  async getCertificates(params = {}) {
    const response = await api.get(
      "/parent/certificates/",
      {
        params: buildQueryParams(params),
      }
    );

    return unwrapResponse(response);
  },

  async getCertificate(certificateId) {
    const response = await api.get(
      `/parent/certificates/${certificateId}/`
    );

    return unwrapResponse(response);
  },

  async issueCertificate(payload) {
    const response = await api.post(
      "/parent/certificates/issue/",
      payload
    );

    return unwrapResponse(response);
  },

  async getCertificateSummary(params = {}) {
    try {
      const response = await api.get(
        "/parent/certificates/",
        {
          params: buildQueryParams(params),
        }
      );

      const certs = unwrapResponse(response);
      const certList = Array.isArray(certs)
        ? certs
        : certs?.results || certs?.certificates || certs?.data || [];

      const uniqueChildren = new Set(
        certList.map((c) => c.child_id || c.child?.id || c.child)
      );

      return {
        total_certificates: certList.length,
        verified: certList.filter((c) => c.verified || c.is_verified).length,
        children_awarded: uniqueChildren.size,
        achievements: certList.filter(
          (c) =>
            c.type === "achievement" ||
            c.certificate_type === "achievement"
        ).length,
      };
    } catch {
      return {
        total_certificates: 0,
        verified: 0,
        children_awarded: 0,
        achievements: 0,
      };
    }
  },
};

/*
|--------------------------------------------------------------------------
| Family Logs and Parent Notes API
|--------------------------------------------------------------------------
*/

export const parentFamilyLogsApi = {
  async getFamilyLogs(params = {}) {
    const response = await api.get(
      "/parent/family-logs/",
      {
        params: buildQueryParams(params),
      }
    );

    return unwrapResponse(response);
  },

  async createFamilyLog(payload) {
    const response = await api.post(
      "/parent/family-logs/",
      payload
    );

    return unwrapResponse(response);
  },

  async updateFamilyLog(logId, payload) {
    const response = await api.patch(
      `/parent/family-logs/${logId}/`,
      payload
    );

    return unwrapResponse(response);
  },

  async deleteFamilyLog(logId) {
    const response = await api.delete(
      `/parent/family-logs/${logId}/`
    );

    return unwrapResponse(response);
  },

  async getChildReadingLogs(childId, params = {}) {
    const response = await api.get(
      `/parent/children/${childId}/reading-logs/`,
      {
        params: buildQueryParams(params),
      }
    );

    return unwrapResponse(response);
  },

  async createChildReadingLog(childId, payload) {
    const response = await api.post(
      `/parent/children/${childId}/reading-logs/`,
      payload
    );

    return unwrapResponse(response);
  },

  async updateChildReadingLog(childId, logId, payload) {
    const response = await api.patch(
      `/parent/children/${childId}/reading-logs/${logId}/`,
      payload
    );

    return unwrapResponse(response);
  },

  async deleteChildReadingLog(childId, logId) {
    const response = await api.delete(
      `/parent/children/${childId}/reading-logs/${logId}/`
    );

    return unwrapResponse(response);
  },
};

/*
|--------------------------------------------------------------------------
| Combined Parent API
|--------------------------------------------------------------------------
|
| You can use either:
|
| parentApi.children.getChildren()
|
| or the individually exported services:
|
| parentChildrenApi.getChildren()
|
| */

export const parentApi = {
  auth: parentAuthApi,
  profile: parentProfileApi,
  dashboard: parentDashboardApi,
  children: parentChildrenApi,
  library: parentLibraryApi,
  progress: parentProgressApi,
  quizzes: parentQuizApi,
  achievements: parentAchievementsApi,
  certificates: parentCertificatesApi,
  familyLogs: parentFamilyLogsApi,

  // Direct helpers used by ParentDashboard page
  getDashboard: (childId) =>
    childId
      ? parentDashboardApi.getChildDashboard(childId)
      : parentDashboardApi.getDashboard(),
  getAchievements: (childId, params) =>
    parentAchievementsApi.getChildAchievements(childId, params),
  getReadingLogs: (childId, params) =>
    parentFamilyLogsApi.getChildReadingLogs(childId, params),
  getChildStories: (childId, params) =>
    parentLibraryApi.getChildStories(childId, params),
  getInsights: (childId, params) =>
    parentDashboardApi.getChildInsights(childId, params),

  // Compatibility helpers for AuthContext & Dashboard
  createChild: (data) => parentChildrenApi.createChild(data),
  updateChild: (id, data) => parentChildrenApi.updateChild(id, data),
  deleteChild: (id) => parentChildrenApi.deleteChild(id),
  createReadingLog: (childId, data) =>
    parentFamilyLogsApi.createChildReadingLog(childId, data),
  deleteReadingLog: (childId, logId) =>
    parentFamilyLogsApi.deleteChildReadingLog(childId, logId),
};

/*
|--------------------------------------------------------------------------
| Generic HTTP Helpers
|--------------------------------------------------------------------------
*/

export const http = {
  get: async (url, config = {}) =>
    unwrapResponse(await api.get(url, config)),

  post: async (url, data = {}, config = {}) =>
    unwrapResponse(await api.post(url, data, config)),

  put: async (url, data = {}, config = {}) =>
    unwrapResponse(await api.put(url, data, config)),

  patch: async (url, data = {}, config = {}) =>
    unwrapResponse(await api.patch(url, data, config)),

  delete: async (url, config = {}) =>
    unwrapResponse(await api.delete(url, config)),
};

export const parentNotesApi = {
  getNotes: (params) => http.get('/parent/notes/', { params }),
  createNote: (data) => http.post('/parent/notes/', data),
  updateNote: (id, data) => http.patch(`/parent/notes/${id}/`, data),
  deleteNote: (id) => http.delete(`/parent/notes/${id}/`),
};

export const parentApprovalsApi = {
  getApprovals: (params) => http.get('/parent/approvals/', { params }),
  approveStory: (id, notes = '') => http.post(`/parent/approvals/${id}/approve/`, { notes }),
  rejectStory: (id, notes = '') => http.post(`/parent/approvals/${id}/reject/`, { notes }),
};

export const parentNotificationsApi = {
  getNotifications: (params) => http.get('/parent/notifications/', { params }),
  markRead: (id) => http.post(`/parent/notifications/${id}/mark_read/`),
  markAllRead: () => http.post('/parent/notifications/mark_all_read/'),
  deleteNotification: (id) => http.delete(`/parent/notifications/${id}/`),
  getUnreadCount: () => http.get('/parent/notifications/unread_count/'),
};

export const parentGoalsApi = {
  getGoals: (childId) => http.get('/parent/goals/', { params: { child_id: childId } }),
  createGoal: (data) => http.post('/parent/goals/', data),
  updateGoal: (id, data) => http.patch(`/parent/goals/${id}/`, data),
  deleteGoal: (id) => http.delete(`/parent/goals/${id}/`),
};

export const parentAnalyticsApi = {
  getAnalytics: (childId) => http.get(`/parent/children/${childId}/analytics/`),
};

export const parentStreakApi = {
  getStreak: (childId) => http.get(`/parent/children/${childId}/streak/`),
};

export const parentScheduleApi = {
  getSchedules: (childId) => http.get('/parent/schedules/', { params: { child_id: childId } }),
  createSchedule: (data) => http.post('/parent/schedules/', data),
  updateSchedule: (id, data) => http.patch(`/parent/schedules/${id}/`, data),
  deleteSchedule: (id) => http.delete(`/parent/schedules/${id}/`),
};

export const parentRatingsApi = {
  getRatings: (storyId) => http.get('/parent/ratings/', { params: { story_id: storyId } }),
  createRating: (data) => http.post('/parent/ratings/', data),
  updateRating: (id, data) => http.patch(`/parent/ratings/${id}/`, data),
  deleteRating: (id) => http.delete(`/parent/ratings/${id}/`),
};

export const parentRewardsApi = {
  getShopItems: () => http.get('/parent/rewards/shop/'),
  getPurchases: (childId) => http.get(`/parent/children/${childId}/rewards/`),
  purchaseItem: (childId, itemId) => http.post(`/parent/children/${childId}/rewards/`, { item_id: itemId }),
};

export const parentTimelineApi = {
  getTimeline: (childId) => http.get(`/parent/children/${childId}/timeline/`),
};

export const parentGrowthApi = {
  getGrowth: (childId) => http.get(`/parent/children/${childId}/growth/`),
};

export const parentComparisonApi = {
  getComparison: () => http.get('/parent/comparison/'),
};

export const parentAIApi = {
  getInsights: (childId) => http.get(`/parent/children/${childId}/ai-insights/`),
  getRecommendations: (childId) => http.get(`/parent/children/${childId}/recommendations/`),
};

export const parentSearchApi = {
  search: (query) => http.get('/parent/search/', { params: { q: query } }),
};

export const parentReportsApi = {
  getExportData: () => http.get('/parent/reports/export/'),
};

/*
|--------------------------------------------------------------------------
| Teacher Module API
|--------------------------------------------------------------------------
*/

export const teacherAPI = {
  getDashboard: () => http.get("/teacher/dashboard/"),
  getAnalysis: () => http.get("/teacher/analysis/"),
  getInbox: (params) => http.get("/teacher/inbox/", { params }),
  markMessageRead: (id) => http.post(`/teacher/inbox/${id}/mark_read/`),
  markAllMessagesRead: () => http.post("/teacher/inbox/mark_all_read/"),
  sendMessage: (data) => http.post("/teacher/inbox/", data),
  deleteMessage: (id) => http.delete(`/teacher/inbox/${id}/`),
  getLessons: (params) => http.get("/teacher/lessons/", { params }),
  createLesson: (data) => http.post("/teacher/lessons/", data),
  updateLesson: (id, data) => http.put(`/teacher/lessons/${id}/`, data),
  deleteLesson: (id) => http.delete(`/teacher/lessons/${id}/`),
  getLessonSubmissions: (id) => http.get(`/teacher/lessons/${id}/submissions/`),
  getStudents: (params) => http.get("/teacher/students/", { params }),
  getStudentDetails: (id) => http.get(`/teacher/students/${id}/details/`),
  issueCertificate: (id, data) => http.post(`/teacher/students/${id}/issue_certificate/`, data),
  getSettings: () => http.get("/teacher/settings/"),
  updateSettings: (data) => http.put("/teacher/settings/", data),

  // Classroom Management API
  getClassrooms: (params) => http.get("/teacher/classrooms/", { params }),
  getClassroomSummaryStats: () => http.get("/teacher/classrooms/summary_stats/"),
  getClassroomDetails: (id) => http.get(`/teacher/classrooms/${id}/`),
  createClassroom: (data) => http.post("/teacher/classrooms/", data),
  updateClassroom: (id, data) => http.patch(`/teacher/classrooms/${id}/`, data),
  deleteClassroom: (id) => http.delete(`/teacher/classrooms/${id}/`),
  archiveClassroom: (id) => http.post(`/teacher/classrooms/${id}/archive/`),
  restoreClassroom: (id) => http.post(`/teacher/classrooms/${id}/restore/`),
  addStudentToClassroom: (id, studentId) => http.post(`/teacher/classrooms/${id}/add_student/`, { student_id: studentId }),
  addStudentsToClassroomBulk: (id, studentIds) => http.post(`/teacher/classrooms/${id}/add_students_bulk/`, { student_ids: studentIds }),
  createAndEnrollStudent: (id, data) => http.post(`/teacher/classrooms/${id}/create_and_enroll_student/`, data),
  getAvailableStudentsForClassroom: (id, params) => http.get(`/teacher/classrooms/${id}/available_students/`, { params }),
  removeStudentFromClassroom: (id, studentId) => http.post(`/teacher/classrooms/${id}/remove_student/`, { student_id: studentId }),
  getClassroomAnalytics: (id) => http.get(`/teacher/classrooms/${id}/analytics/`),
  getClassroomActivity: (id) => http.get(`/teacher/classrooms/${id}/activity/`),
  getClassroomAssignments: (id) => http.get(`/teacher/classrooms/${id}/assignments/`),
  createClassroomAssignment: (id, data) => http.post(`/teacher/classrooms/${id}/assignments/`, data),
  getClassroomLessons: (id) => http.get(`/teacher/classrooms/${id}/lessons/`),
  assignLessonToClassroom: (id, data) => http.post(`/teacher/classrooms/${id}/lessons/`, data),
  getClassroomAIInsights: (id) => http.get(`/teacher/classrooms/${id}/ai_insights/`),
  generateJoinCode: (id) => http.post(`/teacher/classrooms/${id}/generate_join_code/`),

  // Student Management API
  getStudentSummaryStats: () => http.get("/teacher/students/summary_stats/"),
  generateStudentReport: (id, data) => http.post(`/teacher/students/${id}/generate_report/`, data),
  revokeCertificate: (id, certId, reason) => http.post(`/teacher/students/${id}/revoke_certificate/`, { certificate_id: certId, reason }),

  // Assignment Management API
  getAssignments: (params) => http.get("/teacher/assignments/", { params }),
  getAssignmentKPIs: () => http.get("/teacher/assignments/summary_kpis/"),
  getAssignmentDetails: (id) => http.get(`/teacher/assignments/${id}/`),
  createAssignment: (data) => http.post("/teacher/assignments/", data),
  updateAssignment: (id, data) => http.patch(`/teacher/assignments/${id}/`, data),
  deleteAssignment: (id) => http.delete(`/teacher/assignments/${id}/`),
  duplicateAssignment: (id) => http.post(`/teacher/assignments/${id}/duplicate/`),
  archiveAssignment: (id) => http.post(`/teacher/assignments/${id}/archive/`),
  // Schedule & Calendar API
  getSchedule: (params) => http.get("/teacher/schedule/consolidated/", { params }),
  getTodaySummary: () => http.get("/teacher/schedule/today_summary/"),
  createEvent: (data) => http.post("/teacher/schedule/", data),
  updateEvent: (id, data) => http.patch(`/teacher/schedule/${id}/`, data),
  deleteEvent: (id) => http.delete(`/teacher/schedule/${id}/`),
  // Story Library API
  getTeacherStories: (params) => http.get("/teacher/stories/", { params }),
  getRecommendedStories: () => http.get("/teacher/stories/recommended/"),
  toggleSaveStory: (id) => http.post(`/teacher/stories/${id}/toggle_save/`),
  getTeacherStoryDetails: (id) => http.get(`/teacher/stories/${id}/details/`),
};

/*
|--------------------------------------------------------------------------
| Admin Module API
|--------------------------------------------------------------------------
*/

export const adminAPI = {
  getStats: () => http.get("/admin/stats/"),
  getActivityLogs: (params) => http.get("/admin/logs/", { params }),
  getUsers: (params) => http.get("/admin/users/", { params }),
  getUserDetail: (userId) => http.get(`/admin/users/${userId}/`),
  toggleUserActive: (userId) => http.patch(`/admin/users/${userId}/toggle/`),
};

export const storyApi = {
  getStories: (params) => http.get("/stories/", { params }),
  getStory: (id) => http.get(`/stories/${id}/`),
  generateStory: (data) => http.post("/stories/generate/", data),
};

export default api;
