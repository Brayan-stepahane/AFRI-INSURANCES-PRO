import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, spacing, radius, shadows } from '../../config/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'filled' | 'outlined';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'filled' }) => {
  return (
    <View
      style={[
        styles.card,
        variant === 'outlined' ? styles.outlined : styles.filled,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  filled: {
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  outlined: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    ...shadows.sm,
  },
});

