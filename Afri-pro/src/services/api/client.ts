import axios, { AxiosInstance } from 'axios';
import { ENV } from '../../config/env';
import { STORAGE_KEYS } from '../../utils/constants';

// Safe storage access for web
const getToken = async () => {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || undefined;
    }
  } catch (error) {
    console.error('Failed to get auth token:', error);
  }
  return undefined;
};

const setToken = async (token: string) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    }
  } catch (error) {
    console.error('Failed to set auth token:', error);
  }
};

const removeToken = async () => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  } catch (error) {
    console.error('Failed to remove auth token:', error);
  }
};

const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to add auth token to request:', error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token
      await removeToken();
    }
    return Promise.reject(error);
  },
);

export default apiClient;

