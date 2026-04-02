import { Stack } from 'expo-router';
import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { Sidebar } from '../../src/components/layout/Sidebar';
import { colors } from '../../src/config/theme';

export default function AppLayout() {
  const isWeb = Platform.OS === 'web';

  return isWeb ? (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <Sidebar />
      </View>
      <View style={styles.content}>
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
      </View>
    </View>
  ) : (
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: '100%',
    backgroundColor: colors.gray50,
  },
  sidebar: {
    width: 240,
    backgroundColor: colors.violetDark,
  },
  content: {
    flex: 1,
  },
});
