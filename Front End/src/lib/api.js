export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchJson = async (path, { signal, ...options } = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    signal,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export const toQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, value]) => searchParams.set(key, String(value)));

  return searchParams.toString();
};
