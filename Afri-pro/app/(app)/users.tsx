import React, { useEffect, useState, useMemo } from 'react';
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

  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    role: 'commercial' as UserRole,
    phone: '',
    password: '',
    parentId: '', 
    objectif_mensuel: 5000000 as number,          // number for consistent calculations
  });

  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [roleOpen, setRoleOpen] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);

  const ROLE_OPTIONS: UserRole[] = ['commercial', 'manager_adj', 'manager', 'chef_agence', 'admin'];

  // Filter possible parents based on selected role
  const isManagerAdjointRole = (role?: string) => role === 'manager_adj' || role === 'manager_adjoint';

  const possibleParents = useMemo(() => {
    switch (formData.role) {
      case 'commercial':
        return users.filter(u => isManagerAdjointRole(u.role));
      case 'manager_adj':
        return users.filter(u => u.role === 'manager');
      case 'manager':
        return users.filter(u => u.role === 'chef_agence');
      default:
        return [];
    }
  }, [users, formData.role]);

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

    // Hierarchy validation (only for roles that need a parent)
    if (['commercial', 'manager_adj', 'manager'].includes(formData.role) && !formData.parentId) {
      let required = '';
      if (formData.role === 'commercial') required = 'un manager adjoint';
      else if (formData.role === 'manager_adj') required = 'un manager';
      else if (formData.role === 'manager') required = 'un chef_agence d\'agence';
      
      setError(`Veuillez sélectionner ${required}.`);
      return;
    }

    try {
      // Prepare data for backend - convert parentId correctly
      const createData = {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        email: formData.email.trim(),
        role: formData.role,
        phone: formData.phone.trim() || undefined,
        password: formData.password,
        parentId: formData.parentId ? Number(formData.parentId) : null,
        objectifMensuel: formData.objectif_mensuel || undefined,
      };

      // Validation
      if (formData.role === 'commercial' && formData.objectif_mensuel <= 4900000) {
        setError('Objectif mensuel doit être supérieur à 5M FCFA pour un commercial.');
        return;
      }

      const newUser = await userService.createUser(createData);

      setUsers((prev) => [newUser, ...prev]);
      setMessage(`Utilisateur ${newUser.name} créé avec succès.`);

      // Reset form
      setFormData({
        name: '',
        surname: '',
        email: '',
        role: 'commercial',
        phone: '',
        password: '',
        parentId: '',
        objectif_mensuel: 0,
      });
    } catch (err: any) {
      console.error('Create user error:', err);
      setError(err.message || 'Une erreur est survenue lors de la création de l\'utilisateur.');
    }
  };

  const getParentLabel = () => {
    switch (formData.role) {
      case 'commercial': return 'Manager Adjoint';
      case 'manager_adj': return 'Manager';
      case 'manager': return 'chef_agence d\'Agence';
      default: return '';
    }
  };

  // Only admins can access this screen
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
          placeholder="Prénom"
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

       

        {/* Role Selector */}
        <TouchableOpacity 
          style={[styles.input, styles.dropdownTrigger]} 
          onPress={() => setRoleOpen(true)} 
          activeOpacity={0.8}
        >
          <Text style={styles.inputText}>{formData.role}</Text>
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
                    setFormData((prev) => ({ ...prev, role: roleOption, parentId: '' }));
                    setRoleOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{roleOption}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Parent Selector - only for roles that need hierarchy */}
        {['commercial', 'manager_adj', 'manager'].includes(formData.role) && (
          <>
            <Text style={styles.parentLabel}>{getParentLabel()}</Text>
            
            <TouchableOpacity 
              style={[styles.input, styles.dropdownTrigger]}
              onPress={() => possibleParents.length > 0 && setParentOpen(true)}
              activeOpacity={0.8}
              disabled={possibleParents.length === 0}
            >
              <Text style={styles.inputText}>
                {formData.parentId 
                  ? users.find(u => String(u.id) === formData.parentId)?.name || 'Sélectionné'
                  : possibleParents.length > 0 
                    ? `Sélectionnez ${getParentLabel().toLowerCase()}`
                    : `Aucun ${getParentLabel().toLowerCase()} disponible`
                }
              </Text>
              <Text style={styles.dropdownCaret}>▾</Text>
            </TouchableOpacity>

            <Modal transparent visible={parentOpen} animationType="fade" onRequestClose={() => setParentOpen(false)}>
              <TouchableOpacity style={styles.modalOverlay} onPress={() => setParentOpen(false)} activeOpacity={1}>
                <View style={styles.dropdownBox}>
                  {possibleParents.map((parent) => (
                    <TouchableOpacity
                      key={parent.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFormData((prev) => ({ ...prev, parentId: String(parent.id) })); // store as string
                        setParentOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>
                        {parent.name} {parent.surname ? `(${parent.surname})` : ''} - {parent.role}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>
          </>
        )}


{formData.role === 'commercial' && (
        <>
        <Text style={styles.subTitle}>Objectif mensuel (FCFA)</Text>
          <TextInput
            style={styles.input}
            placeholder={formData.objectif_mensuel === 0 ? "Objectif mensuel (FCFA)" : ''}
            value={formData.objectif_mensuel.toString()}
            onChangeText={(t) => setFormData((prev) => ({ ...prev, objectif_mensuel: parseFloat(t.replace(/[^0-9.]/g, '')) || 0 }))}
            keyboardType="numeric"
            placeholderTextColor={colors.gray400}
          />
           
        </>
      )}

        <TouchableOpacity style={styles.createButton} onPress={handleCreateUser} activeOpacity={0.85}>
          
          <Text style={styles.createButtonText}>Créer l'utilisateur</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subTitle}>Liste des utilisateurs</Text>
      {users.length === 0 ? (
        <Text style={styles.text}>Aucun utilisateur trouvé.</Text>
      ) : (
        users.map((u) => (
          <View key={u.id} style={styles.userRow}>
            <Text style={styles.userText}>
              {u.name} {u.surname ? `(${u.surname})` : ''}
            </Text>
            <Text style={styles.userMeta}>{u.role?.toUpperCase()}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50, padding: spacing.xl },
  title: { fontSize: 22, fontWeight: '700', color: colors.violetDark, marginBottom: spacing.sm },
  subTitle: { fontSize: 16, fontWeight: '700', color: colors.violetDark, marginVertical: spacing.sm },
  text: { fontSize: 14, color: colors.gray600, marginBottom: spacing.sm },
  box: { backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray200, padding: spacing.lg, marginVertical: spacing.sm },
  input: { 
    backgroundColor: colors.white, 
    borderWidth: 1, 
    borderColor: colors.gray200, 
    borderRadius: radius.sm, 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.sm, 
    marginBottom: spacing.sm, 
    color: colors.gray800 
  },
  
  button: { marginTop: spacing.xs, backgroundColor: colors.violet, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: 'center' },
  buttonText: { color: colors.white, fontWeight: '700' },
  
  createButton: { marginTop: spacing.lg, backgroundColor: colors.orange, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: 'center' },
  createButtonText: { color: colors.white, fontWeight: '700' },

  userRow: { backgroundColor: colors.white, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.gray100, padding: spacing.sm, marginBottom: spacing.xs },
  userText: { fontSize: 13, color: colors.gray800, fontWeight: '600' },
  userMeta: { fontSize: 11, color: colors.gray400 },

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
    minWidth: 220,
  },
  inputText: { fontSize: 14, color: colors.gray800 },
  dropdownCaret: { fontSize: 16, color: colors.gray400 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: spacing.xl },
  dropdownBox: { backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray200, overflow: 'hidden', minWidth: 220, maxWidth: 280, alignSelf: 'center' },
  dropdownItem: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  dropdownItemText: { fontSize: 14, color: colors.gray800 },

  errorText: { 
    color: '#B91C1C', 
    backgroundColor: '#FEE2E2', 
    padding: 12, 
    borderRadius: radius.sm, 
    borderLeftWidth: 4, 
    borderLeftColor: '#EF4444',
    fontWeight: '600', 
    marginBottom: spacing.sm 
  },
  successText: { 
    color: '#065F46', 
    backgroundColor: '#D1FAE5', 
    padding: 12, 
    borderRadius: radius.sm, 
    borderLeftWidth: 4, 
    borderLeftColor: '#10B981',
    fontWeight: '600', 
    marginBottom: spacing.sm 
  },

  parentLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: colors.violetDark, 
    marginTop: spacing.sm, 
    marginBottom: spacing.xs 
  },
});