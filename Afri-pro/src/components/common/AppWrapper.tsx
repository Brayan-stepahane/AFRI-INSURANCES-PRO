import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Sidebar } from './Sidebar';
import { colors } from '../../config/theme';

interface AppWrapperProps {
  children: React.ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  const isWeb = Platform.OS === 'web';

  if (!isWeb) {
    // Mobile: just render children
    return <>{children}</>;
  }

  // Web: render sidebar + content
  return (
    <View style={styles.container}>
      <Sidebar />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.gray50,
  },
  content: {
    flex: 1,
    overflow: 'auto',
  },
});
