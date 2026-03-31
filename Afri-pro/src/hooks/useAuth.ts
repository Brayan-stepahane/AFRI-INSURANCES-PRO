import { useAuthStore } from '../store';
import { authService } from '../services/auth.service';
import { LoginPayload, RegisterPayload } from '../types/auth.types';
import { getErrorMessage } from '../utils/errors';

export const useAuth = () => {
  const store = useAuthStore();

  const login = async (payload: LoginPayload) => {
    store.setLoading(true);
    store.setError(null);
    try {
      const response = await authService.login(payload);
      store.setToken(response.token);
      store.setUser(response.user);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      store.setError(errorMsg);
      throw err;
    } finally {
      store.setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    store.setLoading(true);
    store.setError(null);
    try {
      const response = await authService.register(payload);
      store.setToken(response.token);
      store.setUser(response.user);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      store.setError(errorMsg);
      throw err;
    } finally {
      store.setLoading(false);
    }
  };

  const handleLogout = async () => {
    store.setLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      store.logout();
      store.setLoading(false);
    }
  };

  return {
    user: store.user,
    token: store.token,
    isLoading: store.isLoading,
    error: store.error,
    login,
    register,
    logout: handleLogout,
    isAuthenticated: !!store.token,
  };
};

