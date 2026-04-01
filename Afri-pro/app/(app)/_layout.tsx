import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="prospections" />
      <Stack.Screen name="cotations" />
      <Stack.Screen name="ventes" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="objectifs" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
