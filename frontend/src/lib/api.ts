import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
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
    api.defaults.headers.common["x-csrf-token"] = token;
  } catch (error) {
    console.error("Failed to fetch CSRF token", error);
  }
};

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
