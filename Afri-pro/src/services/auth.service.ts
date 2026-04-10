import apiClient from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import { AuthResponse, LoginPayload, RegisterPayload, User, UserRole } from '../types/auth.types';

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      identifiant: payload.email,
      password: payload.password,
    });

    const apiUser = response.data.user;
    return {
      token: response.data.token,
      user: {
        id: apiUser.id,
        identifiant: apiUser.identifiant || apiUser.email || '',
        surname: apiUser.prenom || '',
        email: apiUser.email || apiUser.identifiant || '',
        name: apiUser.name || `${[apiUser.nom, apiUser.prenom].filter(Boolean).join(' ')}`.trim() || apiUser.identifiant || '',
        phone: apiUser.phone,
        role: apiUser.role as UserRole,
        equipe: apiUser.equipe,
        objectifMensuel: apiUser.objectif_mensuel ?? apiUser.objectifMensuel,
        createdAt: apiUser.createdAt || new Date().toISOString(),
      },
    };
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
    const apiUser = response.data;
    return {
      id: apiUser.id,
      identifiant: apiUser.identifiant || apiUser.email || '',
      email: apiUser.email || apiUser.identifiant || '',
      name: apiUser.name || `${[apiUser.nom, apiUser.prenom].filter(Boolean).join(' ')}`.trim() || apiUser.identifiant || '',
      surname: apiUser.prenom || '',
      phone: apiUser.phone,
      role: apiUser.role as UserRole,
      equipe: apiUser.equipe,
      objectifMensuel: apiUser.objectif_mensuel ?? apiUser.objectifMensuel,
      createdAt: apiUser.createdAt || new Date().toISOString(),
    };
  },
};

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.LIST);
    return response.data.map((apiUser: any) => ({
      id: apiUser.id,
      email: apiUser.identifiant || apiUser.email || '',
      name: apiUser.name || `${[apiUser.nom, apiUser.prenom].filter(Boolean).join(' ')}`.trim() || apiUser.identifiant || '',
      surname: apiUser.prenom || '',
      phone: apiUser.phone,
      role: apiUser.role as UserRole,
      createdAt: apiUser.created_at || apiUser.createdAt || new Date().toISOString(),
    }));
  },

  createUser: async (payload: { name: string; surname: string; email: string; role: UserRole; phone?: string; password: string }): Promise<User> => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.CREATE, {
      nom: payload.name,
      prenom: payload.surname,
      identifiant: payload.name.trim().toLowerCase().replace(/\s+/g, ''),
      mot_de_passe: payload.password,
      role: payload.role,
      equipe: 'Equipe A',
      objectif_mensuel: 0,
    });

    const apiUser = response.data;
    return {
      id: apiUser.id,
      email: apiUser.identifiant || apiUser.email || '',
      name: `${apiUser.nom || ''} ${apiUser.prenom || ''}`.trim(),
      surname: apiUser.prenom || '',
      phone: apiUser.phone,
      role: apiUser.role as UserRole,
      createdAt: new Date().toISOString(),
    };
  },
};
