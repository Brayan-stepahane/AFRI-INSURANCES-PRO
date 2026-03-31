import apiClient from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth.types';

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, payload);
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, payload);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get(API_ENDPOINTS.USER.PROFILE);
    return response.data;
  },
};
