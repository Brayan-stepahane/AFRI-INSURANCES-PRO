import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing, typography, radius } from '../../src/config/theme';

type UserRole = 'commercial' | 'manager_adj' | 'manager' | 'chef' | 'admin';

interface Role {
  id: UserRole;
  label: string;
  icon: string;
}

const ROLES: Role[] = [
  { id: 'commercial', label: 'Commercial', icon: '👤' },
  { id: 'manager_adj', label: 'Manager adjoint', icon: '👥' },
  { id: 'manager', label: 'Manager', icon: '🏆' },
  { id: 'chef', label: 'Chef agence', icon: '🏢' },
  { id: 'admin', label: 'Administrateur', icon: '⚙️' },
];

const FEATURES = [
  { icon: '🆔', title: 'Clients identifiés', description: 'Chaque client a un ID unique, plus de doublons' },
  { icon: '📋', title: 'Pipeline complet', description: 'Prospection → Cotation → Vente séparés' },
  { icon: '🎯', title: 'Objectifs avec report', description: 'Suivi en temps réel' },
];

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('ngueguim');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('commercial');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleLogin = async () => {
    setValidationError(null);
    if (!email.trim()) { setValidationError('Entrez votre identifiant'); return; }
    if (!password.trim()) { setValidationError('Entrez votre mot de passe'); return; }
    try {
      await login({ email, password });
      router.replace('/(app)/dashboard');
    } catch (err) {
      setValidationError('Identifiant ou mot de passe incorrect');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.wrapper}>
        {/* Brand Section */}
        <View style={styles.brandSection}>
          <Text style={styles.brand}>
            Afri<Text style={styles.brandHighlight}>Pro</Text>
          </Text>
          <Text style={styles.tagline}>
            Plateforme de gestion des prospections, cotations et ventes.
          </Text>
          <View style={styles.features}>
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureIconText}>{feature.icon}</Text>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Login Form Section */}
        <View style={styles.loginSection}>
          <View style={styles.loginBox}>
            <Text style={styles.loginTitle}>Bienvenue</Text>
            <Text style={styles.loginSubtitle}>Connectez-vous à votre espace</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Identifiant</Text>
              <TextInput
                style={[styles.input, validationError && !email ? styles.inputError : null]}
                placeholder="Votre identifiant"
                placeholderTextColor={colors.gray400}
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mot de passe</Text>
              <TextInput
                style={[styles.input, validationError && !password ? styles.inputError : null]}
                placeholder="Votre mot de passe"
                placeholderTextColor={colors.gray400}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rôle (démo)</Text>
              <View style={styles.roleGrid}>
                {ROLES.map((role) => (
                  <Pressable
                    key={role.id}
                    onPress={() => setSelectedRole(role.id)}
                    style={[
                      styles.roleChip,
                      selectedRole === role.id && styles.roleChipSelected,
                      role.id === 'admin' && styles.roleChipWide,
                    ]}
                  >
                    <Text style={styles.roleIcon}>{role.icon}</Text>
                    <Text style={[styles.roleLabel, selectedRole === role.id && styles.roleLabelSelected]}>
                      {role.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {(validationError || error) && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{validationError || error}</Text>
              </View>
            )}

            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            >
              {isLoading
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.loginButtonText}>Se connecter</Text>
              }
            </Pressable>

            <View style={styles.demoBox}>
              <Text style={styles.demoText}>
                Mode démo: Identifiant: <Text style={styles.demoBold}>ngueguim</Text> | Mot de passe: <Text style={styles.demoBold}>demo1234</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  wrapper: { flex: 1 },
  brandSection: {
    backgroundColor: colors.violetDark,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    paddingTop: spacing.xxl * 1.5,
  },
  brand: { ...typography.displayLarge, color: colors.white, marginBottom: spacing.sm },
  brandHighlight: { color: colors.orange },
  tagline: { ...typography.body, color: 'rgba(255,255,255,0.65)', marginBottom: spacing.xl, lineHeight: 24, maxWidth: 320 },
  features: { gap: spacing.md },
  featureItem: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  featureIcon: { width: 34, height: 34, backgroundColor: 'rgba(232,82,26,0.25)', borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center', marginTop: spacing.xs },
  featureIconText: { fontSize: 15 },
  featureContent: { flex: 1 },
  featureTitle: { ...typography.smallBold, color: colors.white, marginBottom: spacing.xs },
  featureDescription: { ...typography.tiny, color: 'rgba(255,255,255,0.8)', lineHeight: 18 },
  loginSection: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
  loginBox: { width: '100%' },
  loginTitle: { ...typography.h1, color: colors.violetDark, marginBottom: spacing.xs },
  loginSubtitle: { ...typography.body, color: colors.gray400, marginBottom: spacing.xl },
  inputGroup: { marginBottom: spacing.lg },
  inputLabel: { ...typography.smallBold, color: colors.gray600, marginBottom: spacing.sm },
  input: { width: '100%', paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderWidth: 1.5, borderColor: colors.gray200, borderRadius: radius.sm, ...typography.body, color: colors.gray800, backgroundColor: colors.white },
  inputError: { borderColor: colors.danger, backgroundColor: colors.dangerBg },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  roleChip: { flex: 1, minWidth: '45%', paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderWidth: 1.5, borderColor: colors.gray200, borderRadius: radius.sm, backgroundColor: colors.white, alignItems: 'center', gap: spacing.xs },
  roleChipWide: { minWidth: '100%' },
  roleChipSelected: { borderColor: colors.violet, backgroundColor: colors.violetPale },
  roleIcon: { fontSize: 20 },
  roleLabel: { ...typography.tiny, color: colors.gray600, textAlign: 'center' },
  roleLabelSelected: { color: colors.violet, fontWeight: '600' },
  errorContainer: { backgroundColor: colors.dangerBg, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.md, marginBottom: spacing.lg },
  errorText: { ...typography.small, color: colors.danger, textAlign: 'center' },
  loginButton: { width: '100%', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.orange, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg, minHeight: 48 },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { ...typography.bodyBold, color: colors.white, fontSize: 15 },
  demoBox: { backgroundColor: colors.gray50, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  demoText: { ...typography.tiny, color: colors.gray600, textAlign: 'center', lineHeight: 18 },
  demoBold: { fontWeight: '600', color: colors.gray800 },
});