import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { colors, spacing } from '../../config/theme';
import { Sidebar } from './Sidebar';

interface AppWrapperProps {
  children: React.ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  const isWeb = Platform.OS === 'web';

  if (!isWeb) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <Sidebar />
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: colors.gray50,
  },
  sidebar: {
    width: 240,
    backgroundColor: colors.violetDark,
    borderRightWidth: 1,
    borderRightColor: colors.gray200,
  },
  content: {
    flex: 1,
    overflow: 'scroll',
  },
});
