export const APP_CONFIG = {
  name: "Portdock",
  description: "Platform deployment aplikasi berbasis Docker.",
  author: "Azril Pramudia",
  year: 2026,
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const PROJECT_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  FAILED: "FAILED",
} as const;

export const USER_ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;
