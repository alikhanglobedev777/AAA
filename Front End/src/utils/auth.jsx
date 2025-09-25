import axios from 'axios';

// Create a pre-configured Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend API base
  withCredentials: true, // 👈 THIS allows sending cookies (sessions)
});

// Register a new user
export const register = async (formData) => {
  const response = await api.post('/auth/register', formData);
  return response.data;
};

// Login user
export const login = async (formData) => {
  const response = await api.post('/auth/login', formData);
  return response.data;
};

// Logout user
export const logout = async () => {
  await api.post('/auth/logout');
};

// Get current user from session
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data.user;
};

export default api;
