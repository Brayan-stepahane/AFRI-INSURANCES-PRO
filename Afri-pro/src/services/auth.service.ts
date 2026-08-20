import apiClient from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import { AuthResponse, LoginPayload, RegisterPayload, User, UserRole, CreateUserPayload, UpdateUserPayload } from '../types/auth.types';

const normalizeRole = (role?: string): UserRole | undefined => {
  if (!role) return undefined;
  if (role === 'manager_adjoint') return 'manager_adjoint';
  return role as UserRole;
};

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      identifiant: payload.identifiant.trim(),
      password: payload.password.trim(),
    });

    const apiUser = response.data.user;
    return {
      token: response.data.token,
      user: {
        id: apiUser.id,
        identifiant: apiUser.identifiant,
        surname: apiUser.prenom,
        email: apiUser.email ,
        name: apiUser.name || `${[apiUser.nom, apiUser.prenom].filter(Boolean).join(' ')}`.trim() || apiUser.identifiant || '',
        phone: apiUser.phone,
        role: normalizeRole(apiUser.role),
        objectifMensuel: apiUser.objectif_mensuel,
        isDefaultPassword: apiUser.is_default_password,
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

  changePassword: async (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.put(`/api/users/${userId}/change-password`, {
      currentPassword,
      newPassword,
    });
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get(API_ENDPOINTS.USER.PROFILE);
    const apiUser = response.data;
    return {
      id: apiUser.id,
      identifiant: apiUser.identifiant,
      email: apiUser.email,
      name: apiUser.name || `${[apiUser.nom, apiUser.prenom].filter(Boolean).join(' ')}`.trim() || apiUser.identifiant || '',
      surname: apiUser.prenom || '',
      phone: apiUser.phone,
      role: normalizeRole(apiUser.role),
      objectifMensuel: apiUser.objectif_mensuel,
      createdAt: apiUser.createdAt || new Date().toISOString(),
    };
  },
};

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.LIST);
    return response.data.map((apiUser: any) => ({
      id: apiUser.id.toString(),
      identifiant: apiUser.identifiant,
      email: apiUser.email,
      name: apiUser.name || `${[apiUser.nom, apiUser.prenom].filter(Boolean).join(' ')}`.trim() || apiUser.identifiant || '',
      surname: apiUser.prenom || '',
      phone: apiUser.phone,
      role: normalizeRole(apiUser.role),
      equipe: apiUser.equipe,
      objectifMensuel: apiUser.objectif_mensuel ?? apiUser.objectifMensuel,
      createdAt: apiUser.created_at || apiUser.createdAt || new Date().toISOString(),
      manager_id: apiUser.manager_id,
      manager_adjoint_id: apiUser.manager_adjoint_id,
      parent_id: apiUser.parent_id,
      active: apiUser.active,
      manager_adjoint_nom: apiUser.manager_adjoint_nom,
      manager_adjoint_prenom: apiUser.manager_adjoint_prenom,
      manager_nom: apiUser.manager_nom,
      manager_prenom: apiUser.manager_prenom,
    }));
  },

  createUser: async (payload: CreateUserPayload): Promise<User> => {
    const normalizedRole = payload.role === 'manager_adjoint' ? 'manager_adjoint' : payload.role;
    const body: any = {
      nom: payload.name,
      prenom: payload.surname,
      identifiant: payload.surname ? payload.surname.trim().toLowerCase() : '',
      mot_de_passe: payload.password,
      role: normalizedRole,
      phone: payload.phone || null,
    };

    if (normalizedRole !== 'admin') {
      body.objectif_mensuel = payload.objectifMensuel || 500000;
    }

    if (payload.parentId && payload.parentId > 0) {
      body.parentId = payload.parentId;
    }

    const response = await apiClient.post(API_ENDPOINTS.USERS.CREATE, body);

    const apiUser = response.data;
    return {
      id: apiUser.id,
      identifiant: apiUser.identifiant,
      email: apiUser.email || '',
      name: `${apiUser.nom || ''} ${apiUser.prenom || ''}`.trim(),
      surname: apiUser.prenom || '',
      phone: apiUser.phone,
      role: normalizeRole(apiUser.role),
      createdAt: new Date().toISOString(),
    };
  },

  updateUser: async (userId: string, payload: UpdateUserPayload): Promise<User> => {
    const normalizedRole = payload.role === 'manager_adjoint' ? 'manager_adjoint' : payload.role;
    const body: any = {
      nom: payload.name,
      prenom: payload.surname,
      role: normalizedRole,
      phone: payload.phone || null,
      equipe: payload.equipe || null,
    };

    if (normalizedRole !== 'admin') {
      body.objectif_mensuel = payload.objectifMensuel;
    }

    if (payload.parentId !== undefined) {
      body.parentId = payload.parentId;
    }

    const response = await apiClient.put(API_ENDPOINTS.USERS.UPDATE.replace(':id', userId), body);
    const apiUser = response.data;
    return {
      id: apiUser.id.toString(),
      identifiant: apiUser.identifiant,
      email: apiUser.email || '',
      name: `${apiUser.nom || ''} ${apiUser.prenom || ''}`.trim(),
      surname: apiUser.prenom || '',
      phone: apiUser.phone,
      role: normalizeRole(apiUser.role),
      createdAt: new Date().toISOString(),
      equipe: apiUser.equipe,
      objectifMensuel: apiUser.objectif_mensuel ?? apiUser.objectifMensuel,
      parent_id: apiUser.parent_id,
      active: apiUser.active,
    };
  },

  toggleUser: async (userId: string): Promise<{ id: number; active: boolean }> => {
    const response = await apiClient.put(API_ENDPOINTS.USERS.TOGGLE.replace(':id', userId));
    return response.data;
  },

  resetPassword: async (userId: string): Promise<{ message: string; user: any; newPassword: string }> => {
    const response = await apiClient.put(API_ENDPOINTS.USERS.RESET_PASSWORD.replace(':id', userId));
    return response.data;
  },
};
