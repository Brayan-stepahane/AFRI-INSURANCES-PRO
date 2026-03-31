import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '../utils/constants';

// Check if we're on a platform that supports SecureStore
const canUseSecureStore = Platform.OS === 'ios' || Platform.OS === 'android';

export const storageService = {
  // Secure storage for sensitive data
  setSecure: async (key: string, value: string): Promise<void> => {
    if (canUseSecureStore) {
      await SecureStore.setItemAsync(key, value);
    } else {
      // Fall back to AsyncStorage on web and other platforms
      await AsyncStorage.setItem(key, value);
    }
  },

  getSecure: async (key: string): Promise<string | null> => {
    if (canUseSecureStore) {
      return await SecureStore.getItemAsync(key);
    } else {
      // Fall back to AsyncStorage on web and other platforms
      return await AsyncStorage.getItem(key);
    }
  },

  removeSecure: async (key: string): Promise<void> => {
    if (canUseSecureStore) {
      await SecureStore.deleteItemAsync(key);
    } else {
      // Fall back to AsyncStorage on web and other platforms
      await AsyncStorage.removeItem(key);
    }
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
