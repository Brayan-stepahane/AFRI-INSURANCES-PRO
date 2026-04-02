import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing, radius } from '../../config/theme';

interface MenuItemProps {
  label: string;
  icon: string;
  route: string;
  isActive: boolean;
  onPress: () => void;
}

function MenuItem({ label, icon, route, isActive, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, isActive && styles.menuItemActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = [
    { label: 'Tableau de bord', icon: '📊', route: '/(app)/dashboard' },
    { label: 'Mes prospections', icon: '📋', route: '/(app)/prospections' },
    { label: 'Mes cotations', icon: '💼', route: '/(app)/cotations' },
    { label: 'Mes ventes', icon: '✅', route: '/(app)/ventes' },
    { label: 'Mon objectif', icon: '🎯', route: '/(app)/objectifs' },
    { label: 'Notifications', icon: '🔔', route: '/(app)/notifications' },
  ];

  const isActive = (route: string) => pathname?.includes(route.split('/').pop() || '');

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoSection}>
        <Text style={styles.logo}>Afri</Text>
        <Text style={[styles.logo, { color: colors.orange }]}>Pro</Text>
      </View>

      {/* Menu Section */}
      <View style={styles.menuSection}>
         <Text style={styles.sectionLabel}>{user?.role}</Text>
        
        <ScrollView showsVerticalScrollIndicator={false} style={styles.menuList}>
          {menuItems.map((item) => (
            <MenuItem
              key={item.route}
              label={item.label}
              icon={item.icon}
              route={item.route}
              isActive={isActive(item.route)}
              onPress={() => router.push(item.route as any)}
            />
          ))}
        </ScrollView>
      </View>

      {/* User Footer */}
      <View style={styles.footerSection}>
        <TouchableOpacity
          style={styles.userCard}
          onPress={() => router.push('/(app)/profile' as any)}
          activeOpacity={0.7}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.name}</Text>
            
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            logout();
            router.replace('/(auth)/login' as any);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.violetDark,
    height: '100%',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    display: 'flex',
    flexDirection: 'column',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    paddingHorizontal: spacing.md,
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.5,
  },
  menuSection: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.lg,
    fontWeight: '600',
    paddingHorizontal: spacing.md,
  },
  menuList: {
    gap: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
    gap: spacing.md,
  },
  menuItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  menuIcon: {
    fontSize: 18,
  },
  menuLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  menuLabelActive: {
    color: colors.white,
    fontWeight: '600',
  },
  footerSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  logoutBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
});
