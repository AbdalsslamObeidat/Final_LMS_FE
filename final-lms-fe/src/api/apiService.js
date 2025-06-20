import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (passwords) => api.put('/auth/change-password', passwords),
  setPassword: (passwordData) => api.post('/auth/set-password', passwordData),
  refreshToken: () => api.post('/auth/refresh-token'),
};

// Course API
export const courseAPI = {
  create: (courseData) => api.post('/courses/create', courseData),
  getAll: () => api.get('/courses/getall'),
  getById: (id) => api.get(`/courses/get/${id}`),
  update: (id, courseData) => api.put(`/courses/update/${id}`, courseData),
  delete: (id) => api.delete(`/courses/delete/${id}`),
  approve: (id, status) => api.patch(`/courses/${id}/approval`, { status }),
  getPending: () => api.get('/courses/pending'),
  publish: (id, published) => api.patch(`/courses/${id}/publish`, { published }),
};

// Module API
export const moduleAPI = {
  getByCourse: (courseId) => api.get(`/modules/course/${courseId}`),
  create: (moduleData) => api.post('/modules/create', moduleData),
  getById: (id) => api.get(`/modules/get/${id}`),
  update: (id, moduleData) => api.put(`/modules/update/${id}`, moduleData),
  delete: (id) => api.delete(`/modules/delete/${id}`),
};

// Lesson API
export const lessonAPI = {
  create: (lessonData) => api.post('/lessons/create', lessonData),
  getById: (id) => api.get(`/lessons/get/${id}`),
  getAll: () => api.get('/lessons/getall'),
  update: (id, lessonData) => api.put(`/lessons/update/${id}`, lessonData),
  delete: (id) => api.delete(`/lessons/delete/${id}`),
};

// Quiz API
export const quizAPI = {
  create: (quizData) => api.post('/quizzes/create', quizData),
  getAll: () => api.get('/quizzes/getall'),
  getById: (id) => api.get(`/quizzes/get/${id}`),
  update: (id, quizData) => api.put(`/quizzes/update/${id}`, quizData),
  delete: (id) => api.delete(`/quizzes/delete/${id}`),
  grade: (quizId, answers) => api.post(`/quizzes/${quizId}/grade`, { answers }),
};

// Assignment API
export const assignmentAPI = {
  create: (assignmentData) => api.post('/assignments/create', assignmentData),
  getAll: () => api.get('/assignments/getall'),
  getById: (id) => api.get(`/assignments/get/${id}`),
  update: (id, assignmentData) => api.put(`/assignments/update/${id}`, assignmentData),
  delete: (id) => api.delete(`/assignments/delete/${id}`),
};

// Submission API
export const submissionAPI = {
  create: (submissionData) => api.post('/submissions/create', submissionData),
  getAll: () => api.get('/submissions/getall'),
  getById: (id) => api.get(`/submissions/get/${id}`),
  update: (id, submissionData) => api.put(`/submissions/update/${id}`, submissionData),
  delete: (id) => api.delete(`/submissions/delete/${id}`),
  grade: (id, gradeData) => api.patch(`/submissions/grade/${id}`, gradeData),
};

// Enrollment API
export const enrollmentAPI = {
  create: (enrollmentData) => api.post('/enrollments/create', enrollmentData),
  getAll: () => api.get('/enrollments/getall'),
  getById: (id) => api.get(`/enrollments/get/${id}`),
  update: (id, enrollmentData) => api.put(`/enrollments/update/${id}`, enrollmentData),
  updateProgress: (id, progressData) => api.patch(`/enrollments/progress/${id}`, progressData),
  delete: (id) => api.delete(`/enrollments/delete/${id}`),
  getByUser: (userId) => api.get(`/enrollments/user/${userId}`),
  getByCourse: (courseId) => api.get(`/enrollments/course/${courseId}`),
};

// Progress API
export const progressAPI = {
  markComplete: (progressData) => api.post('/progress/complete', progressData),
  getProgress: (enrollmentId) => api.get(`/progress/${enrollmentId}`),
};

// Admin API
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUserRole: (id, roleData) => api.patch(`/admin/users/${id}/role`, roleData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getDashboardSummary: () => api.get('/admin/dashboard/summary'),
};

// Analytics API
export const analyticsAPI = {
  getStudentPerformance: () => api.get('/analytics/student-performance'),
};

// Category API
export const categoryAPI = {
  create: (categoryData) => api.post('/categories/create', categoryData),
  getAll: () => api.get('/categories/getall'),
  getById: (id) => api.get(`/categories/get/${id}`),
  update: (id, categoryData) => api.put(`/categories/update/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/delete/${id}`),
};

// Question API
export const questionAPI = {
  create: (questionData) => api.post('/questions/create', questionData),
  getAll: () => api.get('/questions/getall'),
  getById: (id) => api.get(`/questions/get/${id}`),
  update: (id, questionData) => api.put(`/questions/update/${id}`, questionData),
  delete: (id) => api.delete(`/questions/delete/${id}`),
};

export default api;