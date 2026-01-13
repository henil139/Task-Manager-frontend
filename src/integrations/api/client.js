const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Get stored auth token
const getToken = () => localStorage.getItem('token');

// Set auth token
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Get stored user
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Set stored user
export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

// Get stored role
export const getStoredRole = () => localStorage.getItem('role');

// Set stored role
export const setStoredRole = (role) => {
  if (role) {
    localStorage.setItem('role', role);
  } else {
    localStorage.removeItem('role');
  }
};

// Clear all auth data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
};

// API request helper
async function request(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle unauthorized - clear auth data
  if (response.status === 401) {
    clearAuthData();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  // Parse response
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || 'Request failed');
  }

  return data;
}

// API client methods
export const apiClient = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  
  post: (endpoint, data) => request(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  put: (endpoint, data) => request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  patch: (endpoint, data) => request(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export default apiClient;
