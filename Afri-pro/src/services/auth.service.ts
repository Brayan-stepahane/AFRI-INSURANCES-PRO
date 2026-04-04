import apiClient from './api/client';
import { API_ENDPOINTS } from './api/endpoints';
import { AuthResponse, LoginPayload, RegisterPayload, User, UserRole } from '../types/auth.types';

type DemoUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password: string;
  phone?: string;
};

const DEMO_USERS: DemoUser[] = [
  { id: 'u1', email: 'commerciale@afri.com', name: 'Commerciale Demo', role: 'commercial', password: 'demo1234', phone: '+237670000001' },
  { id: 'u2', email: 'manager_adj@afri.com', name: 'Manager Adjoint Demo', role: 'manager_adj', password: 'demo1234', phone: '+237670000002' },
  { id: 'u3', email: 'manager@afri.com', name: 'Manager Demo', role: 'manager', password: 'demo1234', phone: '+237670000003' },
  { id: 'u4', email: 'chef_agence@afri.com', name: 'Chef d\'Agence Demo', role: 'chef', password: 'demo1234', phone: '+237670000004' },
  { id: 'u5', email: 'admin@afri.com', name: 'Admin Demo', role: 'admin', password: 'demo1234', phone: '+237670000005' },
];

const createDemoResponse = (user: DemoUser): AuthResponse => ({
  token: `demo-token-${user.id}`,
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    createdAt: new Date().toISOString(),
  },
});

export const userService = {
  getUsers: (): User[] => {
    return DEMO_USERS.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      phone: u.phone,
      createdAt: new Date().toISOString(),
    }));
  },

  createUser: (payload: { name: string; email: string; role: UserRole; phone?: string; password: string }): User => {
    const exists = DEMO_USERS.some((u) => u.email.toLowerCase() === payload.email.toLowerCase());
    if (exists) {
      throw new Error('Un utilisateur existe déjà avec cet email.');
    }
    const newUser: DemoUser = {
      id: `u${DEMO_USERS.length + 1}`,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      role: payload.role,
      phone: payload.phone?.trim(),
      password: payload.password,
    };
    DEMO_USERS.push(newUser);
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      createdAt: new Date().toISOString(),
    };
  },
};

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, payload);
      const apiUser: User = response.data.user;
      return {
        token: response.data.token,
        user: {
          ...apiUser,
          role: apiUser.role as UserRole,
        },
      };
    } catch (err) {
      // fallback to local demo count for test/demo purposes
      const demoUser = DEMO_USERS.find((u) => u.email.toLowerCase() === payload.email.toLowerCase() && u.password === payload.password);
      if (demoUser) {
        return createDemoResponse(demoUser);
      }
      throw err;
    }
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
