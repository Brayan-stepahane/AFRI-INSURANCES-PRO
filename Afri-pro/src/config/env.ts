import { Platform } from 'react-native';
export const ENV = {
  API_URL: (() => {
    const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;

    if (configuredApiUrl) {
      console.log('Using EXPO_PUBLIC_API_URL:', configuredApiUrl);
      return configuredApiUrl;
    }

    if (Platform.OS === 'web') {
      console.log('🌐 Web: localhost:3000');
      return 'http://localhost:3000';
    }

    const deviceApiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.90:3000';
    console.log('📱 Device:', deviceApiUrl);
    return deviceApiUrl;
  })(),
  
  APP_ENV: 'development',
};
