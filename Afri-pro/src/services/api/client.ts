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

// Add request interceptor to include auth token + LOG ALL REQUESTS
apiClient.interceptors.request.use(
  async (config) => {
    console.log('🚀 API REQUEST:', config.method?.toUpperCase(), config.url, {
      baseURL: ENV.API_URL,
      headers: config.headers,
      data: config.data ? '[HIDDEN DATA]' : null
    });
    
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token added');
      } else {
        console.log('⚠️ No token found');
      }
    } catch (error) {
      console.error('❌ Failed to add auth token:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  },
);

// Add response interceptor for error handling + LOGGING
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API RESPONSE:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('❌ API ERROR:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      console.log('🔓 401 - Clearing token');
      await removeToken();
    }
    return Promise.reject(error);
  },
);

export default apiClient;

