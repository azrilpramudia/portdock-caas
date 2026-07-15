import axios from "axios";
import { API_BASE_URL } from "@/constants/config";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 0, // No timeout to allow heavy Docker builds to finish without dropping connection
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchAndSetCsrfToken = async () => {
  try {
    const response = await axios.get(`${api.defaults.baseURL}/auth/csrf-token`, {
      withCredentials: true,
    });
    const token = response.data.csrfToken;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem("csrf-token", token);
    }
  } catch (error) {
    console.error("Failed to fetch CSRF token", error);
  }
};

// Request interceptor - attach CSRF token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem("csrf-token");
    if (token && !config.headers["x-csrf-token"]) {
      config.headers["x-csrf-token"] = token;
    }
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Prevent refresh if we are already on login or register pages
        const currentPath = window.location.pathname;
        if (currentPath !== "/login" && currentPath !== "/register") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
