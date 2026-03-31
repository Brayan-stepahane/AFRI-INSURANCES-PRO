import { useAuthStore } from '../store';
import { authService } from '../services/auth.service';
import { LoginPayload, RegisterPayload } from '../types/auth.types';
import { getErrorMessage } from '../utils/errors';

export const useAuth = () => {
  const { user, token, isLoading, error, setUser, setToken, logout, setLoading, setError } =
    useAuthStore();

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(payload);
      setToken(response.token);
      setUser(response.user);
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(payload);
      setToken(response.token);
      setUser(response.user);
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      logout();
      setLoading(false);
    }
  };

  return {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout: handleLogout,
    isAuthenticated: !!token,
  };
};
