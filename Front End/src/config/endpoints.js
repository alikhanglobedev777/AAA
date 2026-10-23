// Centralized endpoints for local development and Render deployments.
// VITE_API_URL must include /api, e.g. https://aaa-backend.onrender.com/api.
const configuredApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_BASE = configuredApiUrl.replace(/\/+$/, '');
export const API_ORIGIN = API_BASE.replace(/\/api$/, '');
export const SOCKET_ORIGIN = (import.meta.env.VITE_SOCKET_URL || API_ORIGIN).replace(/\/+$/, '');
