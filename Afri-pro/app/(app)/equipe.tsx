import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { userService } from '../../src/services/auth.service';
import { colors, spacing, radius } from '../../src/config/theme';
import { User } from '../../src/types/auth.types';

const TEAM_ROLES = ['manager', 'manager_adj', 'chef_agence', 'admin'];

export default function EquipeScreen() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const role = user?.role ?? 'commercial';

  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await userService.getUsers();
        setUsers(allUsers);
      } catch (err) {
        console.error('Failed to load team members:', err);
      }
    };

    loadUsers();
  }, []);

  if (!TEAM_ROLES.includes(role)) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Accès refusé</Text>
        <Text style={styles.text}>Vous ne pouvez pas voir l'équipe avec votre rôle actuel.</Text>
      </View>
    );
  }

  const members = users.filter((u: User) => u.role && u.role !== 'admin');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon équipe</Text>
      <Text style={styles.text}>{members.length} membres</Text>
      <FlatList
        data={members}
        keyExtractor={(item: User) => item.id}
        renderItem={({ item }: { item: User }) => (
          <View style={styles.memberCard}>
            <Text style={styles.memberName}>{item.name}</Text>
            <Text style={styles.memberMeta}>Role: {item.role}</Text>
            <Text style={styles.memberMeta}>Email: {item.email}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50, padding: spacing.xl },
  title: { fontSize: 22, fontWeight: '700', color: colors.violetDark, marginBottom: spacing.sm },
  text: { fontSize: 14, color: colors.gray600, marginBottom: spacing.md },
  list: { paddingBottom: spacing.xl },
  memberCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.gray100 },
  memberName: { fontSize: 15, fontWeight: '700', color: colors.violetDark, marginBottom: 4 },
  memberMeta: { fontSize: 12, color: colors.gray600 },
});