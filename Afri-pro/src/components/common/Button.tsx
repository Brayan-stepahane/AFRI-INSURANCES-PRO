import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, spacing, radius, typography } from '../../config/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
}) => {
  const variants = {
    primary: {
      backgroundColor: colors.orange,
      textColor: colors.white,
    },
    secondary: {
      backgroundColor: colors.violetLight,
      textColor: colors.white,
    },
    danger: {
      backgroundColor: colors.danger,
      textColor: colors.white,
    },
    outline: {
      backgroundColor: colors.white,
      textColor: colors.violet,
      borderWidth: 1.5,
      borderColor: colors.violet,
    },
  };

  const variant_style = variants[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: variant_style.backgroundColor,
          borderWidth: variant_style.borderWidth || 0,
          borderColor: variant_style.borderColor,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: variant_style.textColor }]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  text: {
    ...typography.bodyBold,
    fontSize: 15,
  },
});

