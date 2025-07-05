import axios from "axios";
import { useNavigate } from "react-router-dom";

const http_service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request Interceptor
http_service.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("authToken");

    // If token exists, set Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Response Interceptor
http_service.interceptors.response.use(
  (response) => {
    // Return response directly if successful
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      // Clear token from localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default http_service;
