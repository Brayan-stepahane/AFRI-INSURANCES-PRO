import apiClient from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import { AuthResponse, LoginPayload, RegisterPayload, User, UserRole, CreateUserPayload } from '../types/auth.types';

const normalizeRole = (role?: string): UserRole | undefined => {
  if (!role) return undefined;
  return role as UserRole;
};

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      identifiant: payload.identifiant,
      password: payload.password,
    });

    const apiUser = response.data.user;
    return {
      token: response.data.token,
      user: {
        id: apiUser.id,
        identifiant: apiUser.identifiant,
        surname: apiUser.prenom || '',
        email: apiUser.email ,
        name: apiUser.name || `${[apiUser.nom, apiUser.prenom].filter(Boolean).join(' ')}`.trim() || apiUser.identifiant || '',
        phone: apiUser.phone,
        role: normalizeRole(apiUser.role),
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
      identifiant: apiUser.identifiant,
      email: apiUser.email,
      name: apiUser.name || `${[apiUser.nom, apiUser.prenom].filter(Boolean).join(' ')}`.trim() || apiUser.identifiant || '',
      surname: apiUser.prenom || '',
      phone: apiUser.phone,
      role: normalizeRole(apiUser.role),
      objectifMensuel: apiUser.objectif_mensuel ?? apiUser.objectifMensuel,
      createdAt: apiUser.createdAt || new Date().toISOString(),
    };
  },
};

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.LIST);
    return response.data.map((apiUser: any) => ({
      id: apiUser.id.toString(),
      email: apiUser.identifiant,
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
    }));
  },

  createUser: async (payload: CreateUserPayload): Promise<User> => {
    const body: any = {
      nom: payload.name,
      prenom: payload.surname,
      identifiant: payload.name.trim().toLowerCase().replace(/\s+/g, ''),
      mot_de_passe: payload.password,
      role: payload.role === 'manager_adj' ? 'manager_adjoint' : payload.role,
      phone: payload.phone || null,
      objectif_mensuel: payload.objectifMensuel || 500000,
    };

    // Map parentId to correct field by role
    if (payload.parentId !== undefined && payload.parentId !== null) {
      const pid = Number(payload.parentId);
      if (payload.role === 'commercial') {
        body.manager_adjoint_id = pid;
      } else if (payload.role === 'manager_adjoint') {
        body.manager_id = pid;
      } else if (payload.role === 'manager') {
        body.manager_id = pid;
      }
    }

    const response = await apiClient.post(API_ENDPOINTS.USERS.CREATE, body);

    const apiUser = response.data;
    return {
      id: apiUser.id,
      email: apiUser.email || '',
      name: `${apiUser.nom || ''} ${apiUser.prenom || ''}`.trim(),
      surname: apiUser.prenom || '',
      phone: apiUser.phone,
      role: normalizeRole(apiUser.role),
      createdAt: new Date().toISOString(),
    };
  },
};
