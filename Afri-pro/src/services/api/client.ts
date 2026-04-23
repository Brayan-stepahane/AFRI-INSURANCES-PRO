import axios, { AxiosInstance } from 'axios';
import { ENV } from '../../config/env';
import { STORAGE_KEYS } from '../../utils/constants';
import { storageService } from '../storage.service';

// Safe storage access for web
const getToken = async () => {
  try {
    return await storageService.getSecure(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Failed to get auth token:', error);
  }
  return undefined;
};

const setToken = async (token: string) => {
  try {
    await storageService.setSecure(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('Failed to set auth token:', error);
  }
};

const removeToken = async () => {
  try {
    await storageService.removeSecure(STORAGE_KEYS.AUTH_TOKEN);
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

// Log baseURL for debugging
console.log('🔌 API Client initialized with baseURL:', ENV.API_URL);

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

