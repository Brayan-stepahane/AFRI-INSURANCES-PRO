export const ENV = {
  // When testing on a physical device, use your PC's local network IP here.
  // 'localhost' works only in simulators/emulators, not on a separate mobile device.
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  APP_ENV: process.env.EXPO_PUBLIC_ENV || 'development',
};
