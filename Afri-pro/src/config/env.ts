import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const ENV = {
  API_URL: (() => {
    // Priority 1: .env EXPO_PUBLIC_API_URL (Metro bundling)
    // Priority 2: app.json extra.apiUrl  
    // Priority 3: Platform fallback
    
    if (process.env.EXPO_PUBLIC_API_URL) {
      console.log('Using EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
      return process.env.EXPO_PUBLIC_API_URL;
    }

    if (Platform.OS === 'web') {
      console.log('🌐 Web: localhost:3000');
      return 'http://localhost:3000';
    }
    
    console.log('📱 Device: 172.20.10.2:3000 (edit env.ts if IP changes)');
    return 'http://172.20.10.2:3000';
  })(),
  
  APP_ENV: 'development',
};
