import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, spacing } from '../../config/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
}) => {
  const bgColor =
    variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : colors.surface;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, { backgroundColor: bgColor, opacity: disabled ? 0.5 : 1 }, style]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
