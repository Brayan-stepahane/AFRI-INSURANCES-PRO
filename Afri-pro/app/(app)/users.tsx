import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '../../src/config/theme';
import { userService } from '../../src/services/auth.service';
import { UserRole, User } from '../../src/types/auth.types';

export default function UsersScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const role = user?.role ?? 'unknown';
  const ALLOWED_USER_ROLES: UserRole[] = ['commercial', 'manager_adj', 'manager', 'chef', 'admin'];

  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<{ name: string; surname: string; email: string; role: UserRole; phone: string; password: string }>({
    name: '',
    surname: '',
    email: '',
    role: 'commercial' as UserRole,
    phone: '',
    password: '',
  });
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [roleOpen, setRoleOpen] = useState(false);
  const ROLE_OPTIONS: UserRole[] = ['commercial', 'manager_adj', 'manager', 'chef', 'admin'];

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await userService.getUsers();
        setUsers(allUsers);
      } catch (err) {
        setError('Impossible de charger les utilisateurs.');
        console.error('Failed to load users:', err);
      }
    };

    loadUsers();
  }, []);

  const handleCreateUser = async () => {
    setError('');
    setMessage('');

    if (!formData.name || !formData.surname || !formData.password) {
      setError('Nom, prénom et mot de passe sont requis.');
      return;
    }

    if (!ALLOWED_USER_ROLES.includes(formData.role)) {
      setError('Le rôle doit être commercial, manager_adj, manager, chef ou admin.');
      return;
    }

    try {
      const newUser = await userService.createUser(formData);
      setUsers((prev) => [newUser, ...prev]);
      setMessage(`Utilisateur ${newUser.name} créé.`);
      setFormData({ name: '', surname: '', email: '', role: 'commercial', phone: '', password: '' });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Accès refusé</Text>
        <Text style={styles.text}>Seuls les administrateurs peuvent gérer les utilisateurs.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/dashboard' as any)}>
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
          placeholder="prenom"
          value={formData.surname}
          onChangeText={(t) => setFormData((prev) => ({ ...prev, surname: t }))}
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
        <TouchableOpacity style={[styles.input, styles.dropdownTrigger]} onPress={() => setRoleOpen(true)} activeOpacity={0.8}>
          <Text style={styles.inputText}>{formData.role || 'Sélectionnez un rôle'}</Text>
          <Text style={styles.dropdownCaret}>▾</Text>
        </TouchableOpacity>
        <Modal transparent visible={roleOpen} animationType="fade" onRequestClose={() => setRoleOpen(false)}>
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setRoleOpen(false)} activeOpacity={1}>
            <View style={styles.dropdownBox}>
              {ROLE_OPTIONS.map((roleOption) => (
                <TouchableOpacity
                  key={roleOption}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormData((prev) => ({ ...prev, role: roleOption }));
                    setRoleOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{roleOption}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateUser} activeOpacity={0.85}>
          <Text style={styles.createButtonText}>Créer l'utilisateur</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subTitle}>Liste des utilisateurs</Text>
      {users.map((u) => (
        <View key={u.id} style={styles.userRow}>
          <Text style={styles.userText}>{u.name} ({u.surname})</Text>
          <Text style={styles.userMeta}>{u.role ? u.role.toUpperCase() : 'UNKNOWN'}</Text>
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
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
    minWidth: 220,
    maxWidth: 280,
  },
  inputText: { fontSize: 14, color: colors.gray800 },
  dropdownCaret: { fontSize: 16, color: colors.gray400 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: spacing.xl },
  dropdownBox: { backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray200, overflow: 'hidden', minWidth: 220, maxWidth: 280, alignSelf: 'center' },
  dropdownItem: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  dropdownItemText: { fontSize: 14, color: colors.gray800 },
  errorText: { color: colors.danger, fontWeight: '600', marginBottom: spacing.sm },
  successText: { color: colors.teal, fontWeight: '600', marginBottom: spacing.sm },
});
 