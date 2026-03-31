import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing } from '../../config/theme';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container}>
      <Header title="Dashboard" subtitle={`Welcome, ${user?.name || 'User'}`} />

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile Info</Text>
          <Text style={styles.cardText}>Email: {user?.email}</Text>
          {user?.phone && <Text style={styles.cardText}>Phone: {user.phone}</Text>}
        </View>

        <Button
          title="View Profile"
          onPress={() => router.push('/(app)/profile')}
          style={styles.button}
        />

        <Button
          title="Logout"
          variant="danger"
          onPress={handleLogout}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  button: {
    marginBottom: spacing.md,
  },
});
