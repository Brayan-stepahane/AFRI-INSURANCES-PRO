import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing, radius } from '../../config/theme';

interface SidebarItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isWeb = Platform.OS === 'web';

  const menuItems: SidebarItem[] = [
    { label: 'Tableau de bord', icon: '📊', route: '/(app)/dashboard' },
    { label: 'Mes prospections', icon: '📋', route: '/(app)/prospections' },
    { label: 'Mes cotations', icon: '📝', route: '/(app)/cotations' },
    { label: 'Mes ventes', icon: '✅', route: '/(app)/ventes' },
    { label: 'Mon objectif', icon: '🎯', route: '/(app)/objectifs' },
    { label: 'Notifications', icon: '🔔', route: '/(app)/notifications' },
  ];

  const isActive = (route: string): boolean => {
    return pathname.includes(route.split('/').pop() || '');
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, isWeb && styles.sidebarWeb]}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>AfriPro</Text>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>COMMERCIAL</Text>
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.menuItem, isActive(item.route) && styles.menuItemActive]}
            onPress={() => router.push(item.route as any)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={[styles.menuLabel, isActive(item.route) && styles.menuLabelActive]}>
              {item.label}
            </Text>
            {item.badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* User Footer */}
      <View style={styles.footer}>
        <View style={styles.userContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || 'U')[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userRole}>{user?.role || 'Commercial'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.violetDark,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  sidebarWeb: {
    width: 240,
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
  },
  menuContainer: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.lg,
    marginLeft: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  menuItemActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  menuIcon: {
    fontSize: 16,
  },
  menuLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    flex: 1,
  },
  menuLabelActive: {
    color: colors.white,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: colors.danger,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '700',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  userContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  userRole: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  logoutBtn: {
    padding: spacing.md,
  },
  logoutIcon: {
    fontSize: 16,
  },
});
