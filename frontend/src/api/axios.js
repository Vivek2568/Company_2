import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // allow HttpOnly cookies to be sent/received
});

// Add request interceptor to set proper headers
instance.interceptors.request.use(
  (config) => {
    // Let axios set the content-type automatically for FormData
    // If data is FormData, don't set Content-Type (let browser set it with boundary)
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
