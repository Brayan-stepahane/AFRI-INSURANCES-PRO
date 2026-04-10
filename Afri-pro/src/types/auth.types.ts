export type UserRole = 'commercial' | 'manager_adj' | 'manager' | 'chef' | 'admin';

export interface User {
  id: string;
  identifiant?: string;
  email: string;
  name: string;
  surname:string;
  phone?: string;
  role?: UserRole;
  equipe?: string;
  objectifMensuel?: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
  phone?: string;
}
