// axios.js
import axios from 'axios';
// import env from 'dotenv';
const instance = axios.create({
  baseURL: 'http://localhost:5000/api' || import.meta.env.VITE_API_BASE_URL,
  //baseURL: '/api',

  withCredentials: true, // send cookies (accessToken, refreshToken)
  headers: {
    'Content-Type': 'application/json',
  },
});
// Add a request interceptor to include the token in headers
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;