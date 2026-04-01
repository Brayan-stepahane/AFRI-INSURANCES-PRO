import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing, typography, radius } from '../../src/config/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleRegister = async () => {
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Entrez votre nom complet');
      return;
    }
    if (!email.trim()) {
      setValidationError('Entrez votre email');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setValidationError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await register({ name, email, password, phone: phone || undefined });
      router.replace('/(app)/dashboard');
    } catch (err) {
      setValidationError('Erreur lors de l\'inscription');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.brand}>
          Afri<Text style={styles.brandHighlight}>Pro</Text>
        </Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez notre plateforme</Text>

        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nom complet *</Text>
          <TextInput
            style={[styles.input, validationError && !name ? styles.inputError : null]}
            placeholder="Ex: KAMGA Pierre"
            placeholderTextColor={colors.gray400}
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email *</Text>
          <TextInput
            style={[styles.input, validationError && !email ? styles.inputError : null]}
            placeholder="votre@email.com"
            placeholderTextColor={colors.gray400}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!isLoading}
          />
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mot de passe *</Text>
          <TextInput
            style={[styles.input, validationError && !password ? styles.inputError : null]}
            placeholder="Minimum 6 caractères"
            placeholderTextColor={colors.gray400}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Confirmer mot de passe *</Text>
          <TextInput
            style={[
              styles.input,
              validationError && !confirmPassword ? styles.inputError : null,
            ]}
            placeholder="Répétez le mot de passe"
            placeholderTextColor={colors.gray400}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        {/* Phone (Optional) */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Téléphone (optionnel)</Text>
          <TextInput
            style={styles.input}
            placeholder="6XX XXX XXX"
            placeholderTextColor={colors.gray400}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!isLoading}
          />
        </View>

        {/* Error Message */}
        {(validationError || error) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{validationError || error}</Text>
          </View>
        )}

        {/* Register Button */}
        <Pressable
          onPress={handleRegister}
          disabled={isLoading}
          style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.registerButtonText}>Créer un compte</Text>
          )}
        </Pressable>

        {/* Back to Login */}
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Vous avez déjà un compte? Se connecter</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: colors.violetDark,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  brand: {
    ...typography.displayLarge,
    color: colors.white,
  },
  brandHighlight: {
    color: colors.orange,
  },
  formSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.violetDark,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray400,
    marginBottom: spacing.xl,
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
  registerButton: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.orange,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    minHeight: 48,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 15,
  },
  backLink: {
    ...typography.small,
    color: colors.violet,
    textAlign: 'center',
    fontWeight: '500',
  },
});
