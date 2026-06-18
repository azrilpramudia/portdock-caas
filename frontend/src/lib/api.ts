import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 300000, // Increased to 5 minutes to allow Docker builds to finish
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Removed manual request interceptor for JWT since we use HttpOnly cookies

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
