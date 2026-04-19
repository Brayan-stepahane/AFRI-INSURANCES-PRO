export type UserRole = 'commercial' | 'manager_adjoint' | 'manager' | 'chef_agence' | 'admin';

export interface User {
  id: string;
  identifiant?: string;
  email: string;
  name: string;
  surname: string;
  phone?: string;
  role?: UserRole;
  equipe?: string;
  objectifMensuel?: string;
  createdAt: string;
  manager_id?: number;
  manager_adjoint_id?: number;
  parent_id?: number;
  active?: boolean;
  manager_adjoint_nom?: string;
  manager_adjoint_prenom?: string;
}


export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  identifiant: string;
  password: string;
}



export interface RegisterPayload extends LoginPayload {
  name: string;
  phone?: string;
}

export interface CreateUserPayload {
  name: string;
  surname: string;
  email?: string;
  role: UserRole;
  phone?: string;
  password: string;
  objectifMensuel?: number;
  manager_adjoint_id?: number;
  manager_id?: number;
  chef_agence__id?: number;
  parentId?: number | null;
}

