import { Stack } from 'expo-router';
import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { Footer } from '../../src/components/layout/Footer';
import { Sidebar } from '../../src/components/layout/Sidebar';
import { colors } from '../../src/config/theme';

export default function AppLayout() {
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    return (
      <View style={styles.container}>
        <View style={styles.sidebar}>
          <Sidebar />
        </View>
        <View style={styles.content}>
          <View style={styles.stackWrapper}>
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
              <Stack.Screen name="clients" />
              <Stack.Screen name="equipe" />
              <Stack.Screen name="stats" />
              <Stack.Screen name="users" />
              <Stack.Screen name="profile" />
            </Stack>
          </View>
          <Footer />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mobileContainer}>
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
        <Stack.Screen name="clients" />
        <Stack.Screen name="profile" />
      </Stack>
      <Footer />
    </View>
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
    display: 'flex',
    flexDirection: 'column',
  },
  stackWrapper: {
    flex: 1,
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
});
