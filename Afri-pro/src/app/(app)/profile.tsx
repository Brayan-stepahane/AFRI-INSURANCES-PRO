import React from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing } from '../../config/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <Header title="Profile" subtitle="Your account information" />

      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>

        {user?.phone && (
          <View style={styles.infoSection}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{user.phone}</Text>
          </View>
        )}

        <Button
          title="Back"
          variant="secondary"
          onPress={() => router.back()}
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
  infoSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: 16,
    color: colors.text,
  },
  button: {
    marginTop: spacing.lg,
  },
});
