import { useEffect } from 'react';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/store/authStore';

export default function RootLayout() {
  const { token, hydrate } = useAuthStore();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Hydrate auth state on app start
    const handleHydrate = async () => {
      await hydrate();
    };
    handleHydrate();
  }, []);

  // Navigate based on auth state after navigation is ready
  useEffect(() => {
    if (!navigationState?.key) return;

    setTimeout(() => {
      if (!token) {
        router.replace('/(auth)/login');
      } else {
        router.replace('/(app)/dashboard');
      }
    }, 0);
  }, [token, navigationState?.key]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

