import axios from 'axios';

// ✅ Use ONLY env variable
const API_URL = import.meta.env.VITE_API_URL;

console.log('✅ API URL:', API_URL);

// ✅ Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ✅ Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// ✅ Handle responses & errors (FIXED)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('❌ Response error:', error.response.data);

      // ✅ Only clear auth if user is already logged in
      if (error.response.status === 401 && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // ❌ DO NOT force redirect here
        console.warn('🔒 Session expired. Please login again.');
      }

    } else if (error.request) {
      console.error('❌ No response received:', error.request);
    } else {
      console.error('❌ Error:', error.message);
    }

    // ✅ IMPORTANT: keep rejecting error
    return Promise.reject(error);
  }
);

export default api;