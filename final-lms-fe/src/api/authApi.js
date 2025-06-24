import axios from './axiosInstance.js';

export async function fetchCourses() {
  const res = await fetch('/api/courses/getall');
  return res.json();
}

export async function fetchUser() {
  try {
    const { data } = await axios.get('/auth/me');
    return data.user;
  } catch (error) {
    console.error('getMe error:', error);
    throw error;
  }
}

export async function login(email, password) {
  try {
    const { data } = await axios.post('/auth/login', { email, password });
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function register({ name, email, password }) {
  try {
    const { data } = await axios.post('/auth/register', { name, email, password });
    return data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
}

export async function logout() {
  try {
    const { data } = await axios.post('/auth/logout');
    return data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

export async function refreshToken() {
  try {
    const { data } = await axios.post('/auth/refresh-token');
    return data.accessToken;
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
}
