import React from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/common/Button';
import { Header } from '../../src/components/common/Header';
import { Card } from '../../src/components/common/Card';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing, typography, radius } from '../../src/config/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <Header title="Mon Profil" subtitle="Gestion des informations personnelles" />

      <View style={styles.content}>
        {/* Profile Header */}
        <Card variant="outlined" style={styles.profileHeader}>
          <View style={styles.headerContent}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarText}>
                {user?.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || 'U'}
              </Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{user?.name || 'N/A'}</Text>
              <Text style={styles.headerEmail}>{user?.email || 'N/A'}</Text>
            </View>
          </View>
        </Card>

        {/* Personal Information */}
        <Card variant="filled">
          <Text style={styles.sectionTitle}>Informations personnelles</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nom complet</Text>
            <Text style={styles.infoValue}>{user?.name || 'Non renseigné'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || 'Non renseigné'}</Text>
          </View>

          {user?.phone && (
            <>
              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
            </>
          )}
        </Card>

        {/* Account Info */}
        <Card variant="filled">
          <Text style={styles.sectionTitle}>Compte</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Statut</Text>
            <Text style={[styles.infoValue, styles.statusActive]}>Actif</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date de création</Text>
            <Text style={styles.infoValue}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
            </Text>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Modifier le profil"
            onPress={() => {}}
            style={styles.actionButton}
          />
          <Button
            title="Changer le mot de passe"
            variant="outline"
            onPress={() => {}}
            style={styles.actionButton}
          />
        </View>

        {/* Back Button */}
        <Button
          title="Retour"
          variant="secondary"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  profileHeader: {
    marginBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.violet,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.displayMedium,
    color: colors.white,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    ...typography.bodyBold,
    color: colors.violetDark,
    marginBottom: spacing.xs,
  },
  headerEmail: {
    ...typography.small,
    color: colors.gray400,
  },
  sectionTitle: {
    ...typography.smallBold,
    color: colors.violetDark,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  infoLabel: {
    ...typography.small,
    color: colors.gray400,
    fontWeight: '500',
  },
  infoValue: {
    ...typography.small,
    color: colors.gray800,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.lg,
  },
  statusActive: {
    color: colors.success,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  backButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
