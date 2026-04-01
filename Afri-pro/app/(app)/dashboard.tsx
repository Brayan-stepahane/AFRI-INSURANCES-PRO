import React from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/common/Button';
import { Header } from '../../src/components/common/Header';
import { Card } from '../../src/components/common/Card';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing, typography, radius } from '../../src/config/theme';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const role = user?.role ?? 'commercial';
  const capabilityMap: Record<string, string> = {
    commercial: 'Saisir prospections, cotations et ventes · Voir uniquement ses propres données',
    manager_adj: 'Voir et valider les saisies de son équipe',
    manager: 'Tableau de bord de l’équipe · Suivi des objectifs',
    chef: 'Vue globale de toute l’agence · Statistiques consolidées',
    admin: 'Gestion complète : utilisateurs, paramètres, exports Excel',
  };

  const roleLabelMap: Record<string, string> = {
    commercial: 'Commercial',
    manager_adj: 'Manager adjoint',
    manager: 'Manager',
    chef: 'Chef d\'Agence',
    admin: 'Administrateur',
  };

  return (
    <ScrollView style={styles.container}>
      <Header
        title="Tableau de bord"
        subtitle={`Bienvenue, ${user?.name || 'Utilisateur'}`}
      />

      <View style={styles.content}>
        {/* User Profile Card */}
        <Card variant="outlined" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'N/A'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'N/A'}</Text>
              {user?.phone && <Text style={styles.profilePhone}>{user.phone}</Text>}
            </View>
          </View>
        </Card>

        {/* Role summary */}
        <Card variant="outlined" style={styles.profileCard}>
          <Text style={styles.roleTitle}>Rôle : {roleLabelMap[role] || 'Utilisateur'}</Text>
          <Text style={styles.roleDescription}>{capabilityMap[role] || capabilityMap.commercial}</Text>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <Card variant="filled" style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Prospections</Text>
          </Card>
          <Card variant="filled" style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Cotations</Text>
          </Card>
        </View>

        <View style={styles.statsGrid}>
          <Card variant="filled" style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Ventes</Text>
          </Card>
          <Card variant="filled" style={styles.statCard}>
            <Text style={styles.statValue}>0 %</Text>
            <Text style={styles.statLabel}>Objectif</Text>
          </Card>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="+ Nouvelle prospection"
            onPress={() => {}}
            style={styles.actionButton}
          />
          <Button
            title="Voir le profil"
            variant="outline"
            onPress={() => router.push('/(app)/profile')}
            style={styles.actionButton}
          />
        </View>

        {/* Logout Button */}
        <Button
          title="Se déconnecter"
          variant="danger"
          onPress={handleLogout}
          style={styles.logoutButton}
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
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.violet,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.bodyBold,
    color: colors.violetDark,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    ...typography.small,
    color: colors.gray400,
    marginBottom: spacing.xs,
  },
  profilePhone: {
    ...typography.small,
    color: colors.gray600,
  },
  roleTitle: {
    ...typography.smallBold,
    color: colors.violetDark,
    marginBottom: spacing.xs,
  },
  roleDescription: {
    ...typography.small,
    color: colors.gray600,
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  statValue: {
    ...typography.displayMedium,
    color: colors.violet,
    marginBottom: spacing.sm,
  },
  statLabel: {
    ...typography.smallBold,
    color: colors.gray600,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.md,
  },
  logoutButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
});
