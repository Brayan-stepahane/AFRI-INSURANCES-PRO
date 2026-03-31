import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../utils/constants';

export const storageService = {
  // Secure storage for sensitive data
  setSecure: async (key: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(key, value);
  },

  getSecure: async (key: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(key);
  },

  removeSecure: async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key);
  },

  // Async storage for app data
  setAsync: async (key: string, value: unknown): Promise<void> => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  getAsync: async <T>(key: string): Promise<T | null> => {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },

  removeAsync: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },

  clearAll: async (): Promise<void> => {
    await AsyncStorage.clear();
  },
};
