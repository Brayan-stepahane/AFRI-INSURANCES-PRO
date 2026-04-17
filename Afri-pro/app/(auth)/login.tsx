import React, { useState } from 'react';
import {
  StyleSheet, Text, TextInput, View, ScrollView,
  Pressable, ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing, typography, radius } from '../../src/config/theme';

const FEATURES = [
  { icon: '🆔', title: 'Clients identifiés',   description: 'Chaque client a un ID unique, plus de doublons' },
  { icon: '📋', title: 'Pipeline complet',      description: 'Prospection → Cotation → Vente séparés' },
  { icon: '🎯', title: 'Objectifs avec report', description: 'Suivi en temps réel' },
];

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const router = useRouter();
  const { login, isLoading, error } = useAuth();

  const [identifiant, setIdentifiant]      = useState('');
  const [password, setPassword]             = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleLogin = async () => {
    setValidationError(null);
    if (!identifiant.trim()) { setValidationError('Entrez votre identifiant');  return; }
    if (!password.trim())    { setValidationError('Entrez votre mot de passe'); return; }

    try {
      const loggedUser = await login({ identifiant: identifiant, password });
      const role = loggedUser?.role ?? 'commercial';

      const roleRoute: Record<string, string> = {
        commercial: '/dashboard?role=commercial',
        manager_adj: '/dashboard?role=manager_adj',
        manager: '/dashboard?role=manager',
        chef_agence: '/dashboard?role=chef_agence',
        admin: '/dashboard?role=admin',
      };

      router.replace(roleRoute[role] || '/dashboard');
    } catch {
      setValidationError('Identifiant ou mot de passe incorrect');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.containerGrow}>
      <View style={[styles.wrapper, isWide ? styles.wrapperRow : styles.wrapperColumn]}>

        {/* ── Brand Section ── */}
        <View style={styles.brandSection}>
          {/* Decorative blobs */}
          <View style={styles.blob1} />
          <View style={styles.blob2} />

          <Text style={styles.brand}>
            Afri<Text style={styles.brandHighlight}>Pro</Text>
          </Text>
          <Text style={styles.tagline}>
            Plateforme de gestion des prospections, cotations et ventes.
          </Text>

          <View style={styles.features}>
            {FEATURES.map((f) => (
              <View key={f.icon} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureIconText}>{f.icon}</Text>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDescription}>{f.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Login Section ── */}
        <View style={styles.loginSection}>
          <View style={styles.loginBox}>
            <Text style={styles.loginTitle}>Bienvenue</Text>
            <Text style={styles.loginSubtitle}>Connectez-vous à votre espace</Text>

            {/* Identifiant */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Identifiant (nom d'utilisateur)</Text>
              <TextInput
                style={[styles.input, validationError && !identifiant ? styles.inputError : null]}
                placeholder="Votre identifiant de connexion"
                placeholderTextColor={colors.gray400}
                value={identifiant}
                onChangeText={setIdentifiant}
                editable={!isLoading}
                autoCapitalize="none"
                textContentType="username"
                autoComplete="username"
                returnKeyType="next"
              />
            </View>

            {/* Mot de passe */}
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
                textContentType="password"
                autoComplete="password"
                returnKeyType="done"
              />
            </View>

            {/* Error */}
            {(validationError || error) && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{validationError || error}</Text>
              </View>
            )}

            {/* Submit */}
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
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.white },
  containerGrow: { flexGrow: 1 },
  wrapper:       { flex: 1, minHeight: '100%' },
  wrapperRow:    { flexDirection: 'row' },
  wrapperColumn: { flexDirection: 'column' },

  /* ── Brand panel ── */
  brandSection: {
    flex: 1,
    minWidth: 315,
    backgroundColor: colors.violetDark,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    paddingTop: spacing.xxl * 1.5,
    overflow: 'hidden',
  },

  /* Decorative blobs */
  blob1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(180,80,120,0.35)',
  },
  blob2: {
    position: 'absolute',
    bottom: 60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(100,40,160,0.3)',
  },

  brand:          { ...typography.displayLarge, color: colors.white, marginBottom: spacing.sm, position: 'relative', zIndex: 1 },
  brandHighlight: { color: colors.orange },
  tagline: {
    ...typography.body,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: spacing.xl,
    lineHeight: 24,
    maxWidth: 300,
    position: 'relative',
    zIndex: 1,
  },

  features:    { gap: spacing.md, marginTop: 'auto', marginBottom: 'auto', position: 'relative', zIndex: 1 },
  featureItem: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  featureIcon: {
    width: 34,
    height: 34,
    backgroundColor: 'rgba(232,82,26,0.25)',
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  featureIconText:  { fontSize: 15 },
  featureContent:   { flex: 1 },
  featureTitle:     { ...typography.smallBold, color: colors.white, marginBottom: spacing.xs },
  featureDescription: { ...typography.tiny, color: 'rgba(255,255,255,0.8)', lineHeight: 18 },

  /* ── Login panel ── */
  loginSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray50,
  },
  loginBox:     { width: '100%', maxWidth: 420 },
  loginTitle:   { ...typography.h1, color: colors.violetDark, marginBottom: spacing.xs },
  loginSubtitle:{ ...typography.body, color: colors.gray400, marginBottom: spacing.xl },

  inputGroup: { marginBottom: spacing.lg },
  inputLabel: { ...typography.smallBold, color: colors.gray600, marginBottom: spacing.sm },
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
  inputError: { borderColor: colors.danger, backgroundColor: colors.dangerBg },

  /* ── Error ── */
  errorContainer: {
    backgroundColor: colors.dangerBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: { ...typography.small, color: colors.danger, textAlign: 'center' },

  /* ── Button ── */
  loginButton: {
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
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { ...typography.bodyBold, color: colors.white, fontSize: 15 },

  /* ── Demo box ── */
  demoBox: {
    backgroundColor: colors.gray50,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  demoText: { ...typography.tiny, color: colors.gray600, textAlign: 'center', lineHeight: 18 },
  demoBold: { fontWeight: '600', color: colors.gray800 },
});