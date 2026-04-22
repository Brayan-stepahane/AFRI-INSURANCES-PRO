import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet,
} from 'react-native';
import { colors, spacing, typography, radius } from '../../config/theme';

interface ChangePasswordModalProps {
  visible: boolean;
  onSuccess?: () => void;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onSuccess,
  onChangePassword,
  isLoading = false,
  error = null,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChangePassword = async () => {
    setValidationError(null);

    // Validation
    if (!currentPassword.trim()) {
      setValidationError('Entrez votre mot de passe actuel');
      return;
    }
    if (!newPassword.trim()) {
      setValidationError('Entrez votre nouveau mot de passe');
      return;
    }
    if (!confirmPassword.trim()) {
      setValidationError('Confirmez votre nouveau mot de passe');
      return;
    }
    if (newPassword.length < 6) {
      setValidationError('Le nouveau mot de passe doit avoir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    if (newPassword === currentPassword) {
      setValidationError('Le nouveau mot de passe doit être différent du mot de passe actuel');
      return;
    }

    try {
      await onChangePassword(currentPassword, newPassword);
      // Reset form on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setValidationError(null);
      onSuccess?.();
    } catch (err) {
      // Error is handled by parent and passed via error prop
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Changer votre mot de passe</Text>
            <Text style={styles.subtitle}>
              Pour votre sécurité, vous devez changer le mot de passe par défaut
            </Text>
          </View>

          {/* Form */}
          <View style={styles.content}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mot de passe actuel</Text>
              <TextInput
                style={[styles.input, validationError && !currentPassword ? styles.inputError : null]}
                placeholder="Entrez votre mot de passe actuel"
                placeholderTextColor={colors.gray400}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                editable={!isLoading}
                textContentType="password"
              />
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
              <TextInput
                style={[styles.input, validationError && !newPassword ? styles.inputError : null]}
                placeholder="Entrez votre nouveau mot de passe"
                placeholderTextColor={colors.gray400}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                editable={!isLoading}
                textContentType="newPassword"
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmer le nouveau mot de passe</Text>
              <TextInput
                style={[styles.input, validationError && !confirmPassword ? styles.inputError : null]}
                placeholder="Confirmez votre nouveau mot de passe"
                placeholderTextColor={colors.gray400}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!isLoading}
                textContentType="newPassword"
              />
            </View>

            {/* Error Message */}
            {(validationError || error) && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{validationError || error}</Text>
              </View>
            )}

            {/* Submit Button */}
            <Pressable
              onPress={handleChangePassword}
              disabled={isLoading}
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Mettre à jour le mot de passe</Text>
              )}
            </Pressable>

            {/* Info Text */}
            <Text style={styles.infoText}>
              Vous serez redirigé vers le tableau de bord après la modification.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: colors.violetDark,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.smallBold,
    color: colors.gray600,
    marginBottom: spacing.sm,
  },
  input: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    borderRadius: radius.sm,
    ...typography.body,
    color: colors.gray800,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerBg,
  },
  errorContainer: {
    backgroundColor: colors.dangerBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.small,
    color: colors.danger,
    textAlign: 'center',
  },
  submitButton: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.orange,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginBottom: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 15,
  },
  infoText: {
    ...typography.tiny,
    color: colors.gray400,
    textAlign: 'center',
    lineHeight: 18,
  },
});
