import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '../../src/config/theme';
import { userService } from '../../src/services/auth.service';
import { UserRole, User } from '../../src/types/auth.types';

export default function UsersScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const role = user?.role ?? 'commercial';

  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'commercial' as UserRole,
    phone: '',
    password: '',
  });
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const allUsers = userService.getUsers();
    setUsers(allUsers);
  }, []);

  const handleCreateUser = () => {
    setError('');
    setMessage('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Nom, email et mot de passe sont requis.');
      return;
    }

    try {
      const newUser = userService.createUser(formData);
      setUsers((prev) => [newUser, ...prev]);
      setMessage(`Utilisateur ${newUser.name} créé.`);
      setFormData({ name: '', email: '', role: 'commercial', phone: '', password: '' });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Accès refusé</Text>
        <Text style={styles.text}>Seuls les administrateurs peuvent gérer les utilisateurs.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(app)/dashboard' as any)}>
          <Text style={styles.buttonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Gestion des utilisateurs</Text>
      <Text style={styles.text}>Role: {role}</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {message ? <Text style={styles.successText}>{message}</Text> : null}

      <View style={styles.box}>
        <Text style={styles.subTitle}>Créer un nouvel utilisateur</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={formData.name}
          onChangeText={(t) => setFormData((prev) => ({ ...prev, name: t }))}
          placeholderTextColor={colors.gray400}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(t) => setFormData((prev) => ({ ...prev, email: t }))}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.gray400}
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={formData.password}
          onChangeText={(t) => setFormData((prev) => ({ ...prev, password: t }))}
          secureTextEntry
          placeholderTextColor={colors.gray400}
        />
        <TextInput
          style={styles.input}
          placeholder="Téléphone (optionnel)"
          value={formData.phone}
          onChangeText={(t) => setFormData((prev) => ({ ...prev, phone: t }))}
          placeholderTextColor={colors.gray400}
        />
        <TextInput
          style={styles.input}
          placeholder="Role (commercial, manager_adj, manager, chef, admin)"
          value={formData.role}
          onChangeText={(t) => setFormData((prev) => ({ ...prev, role: t as UserRole }))}
          placeholderTextColor={colors.gray400}
        />
        <TouchableOpacity style={styles.createButton} onPress={handleCreateUser} activeOpacity={0.85}>
          <Text style={styles.createButtonText}>Créer l'utilisateur</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subTitle}>Liste des utilisateurs</Text>
      {users.map((u) => (
        <View key={u.id} style={styles.userRow}>
          <Text style={styles.userText}>{u.name} ({u.email})</Text>
          <Text style={styles.userMeta}>{(u.role || 'unknown').toUpperCase()}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50, padding: spacing.xl },
  title: { fontSize: 22, fontWeight: '700', color: colors.violetDark, marginBottom: spacing.sm },
  subTitle: { fontSize: 16, fontWeight: '700', color: colors.violetDark, marginVertical: spacing.sm },
  text: { fontSize: 14, color: colors.gray600, marginBottom: spacing.sm },
  box: { backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray200, padding: spacing.lg, marginVertical: spacing.sm },
  input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.sm, color: colors.gray800 },
  button: { marginTop: spacing.xs, backgroundColor: colors.violet, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: 'center' },
  buttonText: { color: colors.white, fontWeight: '700' },
  createButton: { marginTop: spacing.lg, backgroundColor: colors.orange, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: 'center' },
  createButtonText: { color: colors.white, fontWeight: '700' },
  userRow: { backgroundColor: colors.white, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.gray100, padding: spacing.sm, marginBottom: spacing.xs },
  userText: { fontSize: 13, color: colors.gray800, fontWeight: '600' },
  userMeta: { fontSize: 11, color: colors.gray100 },
  errorText: { color: colors.danger, fontWeight: '600', marginBottom: spacing.sm },
  successText: { color: colors.teal, fontWeight: '600', marginBottom: spacing.sm },
});
