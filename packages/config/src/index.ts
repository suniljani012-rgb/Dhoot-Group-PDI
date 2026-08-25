export const APP_CONFIG = {
  API_VERSION: 'v1',
  BASE_PATH: '/api/v1',
  AUTH: {
    ACCESS_TOKEN_EXPIRY_SECONDS: 900,
    REFRESH_TOKEN_EXPIRY_SECONDS: 604800,
    MAX_FAILED_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 15,
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  RATE_LIMITS: {
    AUTH_LOGIN: { limit: 10, windowSeconds: 60 },
    API_DEFAULT: { limit: 100, windowSeconds: 60 },
  },
} as const;
