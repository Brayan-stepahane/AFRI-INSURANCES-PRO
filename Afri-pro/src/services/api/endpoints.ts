export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE: '/api/user/profile',
    CHANGE_PASSWORD: '/api/users/:id/change-password',
  },
  USERS: {
    LIST: '/api/users',
    CREATE: '/api/users',
    UPDATE: '/api/users/:id',
    TOGGLE: '/api/users/:id/toggle',
    RESET_PASSWORD: '/api/users/:id/reset-password',
  },
  DASHBOARD: {
    STATS: '/api/dashboard',
    CA_HISTORIQUE: '/api/dashboard/ca-historique',
  },
  COTATIONS: {
    LIST: '/api/cotations',
    CREATE: '/api/cotations',
    UPDATE: '/api/cotations',
  },
  VENTES: {
    LIST: '/api/ventes',
    CREATE: '/api/ventes',
    UPDATE: '/api/ventes',
  },
  CLIENTS: {
    LIST: '/api/clients',
    CREATE: '/api/clients',
    UPDATE: '/api/clients',
  },
  PROSPECTIONS: {
    LIST: '/api/prospections',
    CREATE: '/api/prospections',
    UPDATE: '/api/prospections',
  },
};
