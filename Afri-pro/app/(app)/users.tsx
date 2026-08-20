import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '../../src/config/theme';
import { userService } from '../../src/services/auth.service';
import { objectifsService, ObjectiveAllocationRequest } from '../../src/services/objectifs.service';
import { UserRole, User } from '../../src/types/auth.types';

export default function UsersScreen() {
  const { user, token } = useAuth();
  const router = useRouter();
  const role = user?.role ?? 'unknown';

  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    role: 'commercial' as UserRole,
    phone: '',
    password: 'Pass1234',
    parentId: '',
    objectif_mensuel: 10000000,  // Default 10M for commercial
  });

  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [roleOpen, setRoleOpen] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [editParentOpen, setEditParentOpen] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetUser, setResetUser] = useState<{id: string, name: string} | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [allocationModalVisible, setAllocationModalVisible] = useState(false);
  const [allocationManagerOpen, setAllocationManagerOpen] = useState(false);
  const [allocationFormData, setAllocationFormData] = useState({
    managerId: '',
    totalVie: 5000000,
    totalNonVie: 5000000,
    mois: new Date().toISOString().slice(0, 7) + '-01', // Current month first day
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    surname: '',
    role: 'commercial' as UserRole,
    phone: '',
    parentId: '',
    objectif_mensuel: 10000000,
    equipe: '',
  });

  const ROLE_OPTIONS: UserRole[] = ['commercial', 'manager_adjoint', 'manager', 'chef_agence', 'admin'];

  // Filter possible parents based on selected role
  const isManagerAdjointRole = (role?: string) => role === 'manager_adjoint';

  const possibleParents = useMemo(() => {
    switch (formData.role) {
      case 'commercial':
        return users.filter(u => isManagerAdjointRole(u.role));
      case 'manager_adjoint':
        return users.filter(u => u.role === 'manager');
      case 'manager':
        return users.filter(u => u.role === 'chef_agence');
      default:
        return [];
    }
  }, [users, formData.role]);

  const editPossibleParents = useMemo(() => {
    switch (editFormData.role) {
      case 'commercial':
        return users.filter(u => isManagerAdjointRole(u.role));
      case 'manager_adjoint':
        return users.filter(u => u.role === 'manager');
      case 'manager':
        return users.filter(u => u.role === 'chef_agence');
      default:
        return [];
    }
  }, [users, editFormData.role]);

  const getEditParentLabel = () => {
    switch (editFormData.role) {
      case 'commercial': return 'Manager Adjoint';
      case 'manager_adjoint': return 'Manager';
      case 'manager': return 'chef_agence d\'Agence';
      default: return '';
    }
  };

  const formatName = (user?: { name?: string | null; surname?: string | null }) => {
    if (!user) return '';
    const name = user.name?.trim() || '';
    const surname = user.surname?.trim() || '';
    if (!name) return surname;
    if (!surname) return name;
    const normalizedName = name.replace(/\s+/g, ' ').trim();
    const normalizedSurname = surname.replace(/\s+/g, ' ').trim();
    if (normalizedName.toLowerCase().endsWith(normalizedSurname.toLowerCase())) {
      return normalizedName;
    }
    return `${normalizedName} ${normalizedSurname}`;
  };

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

  const handleToggleUser = async (userId: string, currentActive: boolean) => {
    try {
      await userService.toggleUser(userId);
      setMessage(`Utilisateur ${currentActive ? 'désactivé' : 'activé'} avec succès.`);
      // Reload users
      const allUsers = await userService.getUsers();
      setUsers(allUsers);
    } catch (err) {
      setError('Erreur lors de la modification du statut utilisateur.');
      console.error('Failed to toggle user:', err);
    }
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    console.log('🚨 ResetPassword called with userId:', userId);
    setResetUser({ id: userId, name: userName });
    setResetModalVisible(true);
  };

  const openEditModal = (user: User) => {
    setEditUserId(user.id);
    setEditFormData({
      name: user.name,
      surname: user.surname,
      role: user.role || 'commercial',
      phone: user.phone || '',
      parentId: user.parent_id ? String(user.parent_id) : '',
      objectif_mensuel: user.objectifMensuel ? Number(user.objectifMensuel) : 1000000,
      equipe: user.equipe || '',
    });
    setEditModalVisible(true);
  };

  const handleUpdateUser = async () => {
    if (!editUserId) {
      setError('Aucun utilisateur sélectionné pour la modification.');
      return;
    }

    if (!editFormData.name || !editFormData.surname) {
      setError('Nom de famille et prénom sont requis.');
      return;
    }

    if (['commercial', 'manager_adjoint', 'manager', 'chef_agence'].includes(editFormData.role) && editFormData.objectif_mensuel <= 5000000) {
      setError('Objectif mensuel doit être supérieur à 5M FCFA.');
      return;
    }

    if (['commercial', 'manager_adjoint', 'manager'].includes(editFormData.role) && !editFormData.parentId) {
      setError(`Veuillez sélectionner ${getEditParentLabel().toLowerCase()}.`);
      return;
    }

    try {
      const payload = {
        name: editFormData.name.trim(),
        surname: editFormData.surname.trim(),
        role: editFormData.role,
        phone: editFormData.phone.trim() || undefined,
        objectifMensuel: editFormData.objectif_mensuel,
        parentId: editFormData.parentId ? Number(editFormData.parentId) : null,
        equipe: editFormData.equipe.trim() || undefined,
      };

      const updatedUser = await userService.updateUser(editUserId, payload);
      setUsers((prev) => prev.map((u) => (u.id === editUserId ? { ...u, ...updatedUser } : u)));
      setMessage('Utilisateur modifié avec succès.');
      setEditModalVisible(false);
      setError('');
    } catch (err: any) {
      console.error('Update user error:', err);
      setError(err.response?.data?.error || err.message || 'Erreur lors de la modification de l\'utilisateur.');
    }
  };

  const confirmResetPassword = async () => {
    if (!resetUser) return;
    
    try {
      console.log('🌐 Calling API resetPassword for userId:', resetUser.id);
      const result = await userService.resetPassword(resetUser.id);
      console.log('✅ ResetPassword success:', result);
      setMessage(`Mot de passe réinitialisé avec succès. Nouveau mot de passe: ${result.newPassword}`);
      // Reload users
      const allUsers = await userService.getUsers();
      setUsers(allUsers);
    } catch (err: any) {
      console.error('❌ ResetPassword failed:', err.response?.data || err.message);
      setError(`Erreur: ${err.response?.data?.error || err.message || 'Réinitialisation échouée'}`);
    } finally {
      setResetModalVisible(false);
      setResetUser(null);
    }
  };

  const handleCreateUser = async () => {
    setError('');
    setMessage('');

    if (!formData.name || !formData.surname) {
      setError('Nom de famille et prénom sont requis.');
      return;
    }

    // Set default password if not provided
    const passwordToUse = formData.password || 'Pass1234';

    // Hierarchy validation (only for roles that need a parent)
    if (['commercial', 'manager_adjoint', 'manager'].includes(formData.role) && !formData.parentId) {
      let required = '';
      if (formData.role === 'commercial') required = 'un manager adjoint';
      else if (formData.role === 'manager_adjoint') required = 'un manager';
      else if (formData.role === 'manager') required = 'un chef_agence d\'agence';
      
      setError(`Veuillez sélectionner ${required}.`);
      return;
    }

    try {
      // Prepare data for backend - convert parentId correctly
      const parentIdNum = formData.parentId && formData.parentId !== '' ? Number(formData.parentId) : null;
      
      // Verify parentId is valid for roles that require it
      if (['commercial', 'manager_adjoint', 'manager'].includes(formData.role) && !parentIdNum) {
        setError('Parent ID invalide. Veuillez sélectionner un parent valide.');
        return;
      }

      const createData: any = {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        role: formData.role,
        phone: formData.phone.trim() || undefined,
        password: passwordToUse,
        parentId: parentIdNum,
        objectifMensuel: formData.objectif_mensuel,
      };

      // Validation
      if (['commercial', 'manager_adjoint', 'manager', 'chef_agence'].includes(formData.role) && formData.objectif_mensuel <= 5000000) {
        setError('Objectif mensuel doit être supérieur à 5M FCFA.');
        return;
      }

      const newUser = await userService.createUser(createData);

      setUsers((prev) => [newUser, ...prev]);
      setMessage(`Utilisateur ${newUser.name} créé avec succès.`);

      // Reset form
      setFormData({
        name: '',
        surname: '',
        role: 'commercial',
        phone: '',
        password: 'Pass1234',
        parentId: '',
        objectif_mensuel: 10000000,
      });
    } catch (err: any) {
      console.error('Create user error:', err);
      setError(err.message || 'Une erreur est survenue lors de la création de l\'utilisateur.');
    }
  };

  const handleAllocateObjectives = async () => {
    setError('');
    setMessage('');

    if (!allocationFormData.managerId) {
      setError('Veuillez sélectionner un manager.');
      return;
    }

    if (allocationFormData.totalVie <= 0 || allocationFormData.totalNonVie <= 0) {
      setError('Les montants VIE et NON-VIE doivent être supérieurs à 0.');
      return;
    }

    if (!token) {
      setError('Non authentifié. Veuillez vous reconnecter.');
      return;
    }

    try {
      const allocationData: ObjectiveAllocationRequest = {
        managerId: parseInt(allocationFormData.managerId),
        totalVie: allocationFormData.totalVie,
        totalNonVie: allocationFormData.totalNonVie,
        mois: allocationFormData.mois,
      };

      const result = await objectifsService.allocateObjectives(allocationData, token);

      setMessage(`Objectifs alloués avec succès ! ${result.allocations.length} commerciaux affectés.`);
      setAllocationModalVisible(false);

      // Reset form
      setAllocationFormData({
        managerId: '',
        totalVie: 5000000,
        totalNonVie: 5000000,
        mois: new Date().toISOString().slice(0, 7) + '-01',
      });
    } catch (err: any) {
      console.error('Allocation error:', err);
      setError(err.error || err.message || 'Erreur lors de l\'allocation des objectifs.');
    }
  };

  const openAllocationModal = () => {
    setAllocationFormData({
      managerId: '',
      totalVie: 5000000,
      totalNonVie: 5000000,
      mois: new Date().toISOString().slice(0, 7) + '-01',
    });
    setAllocationModalVisible(true);
  };

  const getParentLabel = () => {
    switch (formData.role) {
      case 'commercial': return 'Manager Adjoint';
      case 'manager_adjoint': return 'Manager';
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
    <View style={{ flex: 1 }}>
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
        {['commercial', 'manager_adjoint', 'manager'].includes(formData.role) && (
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
                  ? formatName(users.find(u => String(u.id) === formData.parentId)) || 'Sélectionné'
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
                  {possibleParents.map((parent, index) => (
                    <TouchableOpacity
                      key={parent.id ?? `parent-${index}`}
                      style={styles.dropdownItem}
                      onPress={() => {
                        if (parent.id) {
                          setFormData((prev) => ({ ...prev, parentId: parent.id! }));
                          setParentOpen(false);
                        } else {
                          setError('Erreur : Parent ID invalide');
                        }
                      }}
                    >
                      <Text style={styles.dropdownItemText}>
                        {formatName(parent)} - {parent.role}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>
          </>
        )}


{['commercial', 'manager_adjoint', 'manager', 'chef_agence'].includes(formData.role) && (
        <>
        <Text style={styles.subTitle}>Objectif mensuel (FCFA)</Text>
            <TextInput
              style={styles.input}
              placeholder="Objectif mensuel (FCFA)"
              value={formData.objectif_mensuel > 0 ? formData.objectif_mensuel.toLocaleString() : ''}
              onChangeText={(t) => {
                const cleanValue = t.replace(/[^0-9.]/g, '');
                setFormData((prev) => ({ ...prev, objectif_mensuel: cleanValue ? parseFloat(cleanValue) || 5000000 : 5000000 }));
              }}
              keyboardType="numeric"
              placeholderTextColor={colors.gray400}
            />
           
        </>
      )}

        <TouchableOpacity style={styles.createButton} onPress={handleCreateUser} activeOpacity={0.85}>
          
          <Text style={styles.createButtonText}>Créer l'utilisateur</Text>
        </TouchableOpacity>

        {(role === 'admin' || role === 'manager' || role === 'chef_agence') && (
          <TouchableOpacity style={[styles.createButton, { backgroundColor: colors.success }]} onPress={openAllocationModal} activeOpacity={0.85}>
            <Text style={styles.createButtonText}>Allouer les objectifs</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.subTitle}>Liste des utilisateurs</Text>
      {users.length === 0 ? (
        <Text style={styles.text}>Aucun utilisateur trouvé.</Text>
      ) : (
        users.map((u) => {
          console.log('📋 Rendering user:', u.id, u.name, u.role);
          if (!u.id) {
            console.warn('⚠️ Skipping user without ID:', u);
            return null;
          }
          return (
            <View key={u.id} style={styles.userRow}>
              <View style={styles.userInfo}>
                <Text style={styles.userText}>
                  {formatName(u)}
                </Text>
                <Text style={styles.userMeta}>{u.role?.toUpperCase()} - {u.active ? 'Actif' : 'Inactif'}</Text>
              </View>
              {u.id && role === 'admin' && (
                <View style={styles.userActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => openEditModal(u)}
                  >
                    <Text style={styles.actionButtonText}>Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, u.active ? styles.deactivateButton : styles.activateButton]}
                    onPress={() => handleToggleUser(u.id!, u.active || false)}
                  >
                    <Text style={styles.actionButtonText}>
                      {u.active ? 'Désactiver' : 'Activer'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.resetButton, {opacity: 1, minHeight: 32, paddingHorizontal: 12}]}
                    onPress={() => {
                      console.log('🔄 Reset MDP clicked for user:', u.id, u.name);
                      handleResetPassword(u.id!, formatName(u));
                    }}
                  >
                    <Text style={styles.actionButtonText}>Reset MDP</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })
      )}
      </ScrollView>

      {/* Edit User Modal */}
      <Modal
        transparent
        visible={editModalVisible}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalBox}>
            <Text style={styles.resetModalTitle}>Modifier l'utilisateur</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom de famille"
              value={editFormData.name}
              onChangeText={(t) => setEditFormData((prev) => ({ ...prev, name: t }))}
              placeholderTextColor={colors.gray400}
            />
            <TextInput
              style={styles.input}
              placeholder="Prénom"
              value={editFormData.surname}
              onChangeText={(t) => setEditFormData((prev) => ({ ...prev, surname: t }))}
              placeholderTextColor={colors.gray400}
            />
            <TextInput
              style={styles.input}
              placeholder="Téléphone (optionnel)"
              value={editFormData.phone}
              onChangeText={(t) => setEditFormData((prev) => ({ ...prev, phone: t }))}
              placeholderTextColor={colors.gray400}
            />
            <TouchableOpacity
              style={[styles.input, styles.dropdownTrigger]}
              onPress={() => setEditRoleOpen(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.inputText}>{editFormData.role}</Text>
              <Text style={styles.dropdownCaret}>▾</Text>
            </TouchableOpacity>
            <Modal transparent visible={editRoleOpen} animationType="fade" onRequestClose={() => setEditRoleOpen(false)}>
              <TouchableOpacity style={styles.modalOverlay} onPress={() => setEditRoleOpen(false)} activeOpacity={1}>
                <View style={styles.dropdownBox}>
                  {ROLE_OPTIONS.map((roleOption) => (
                    <TouchableOpacity
                      key={roleOption}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setEditFormData((prev) => ({ ...prev, role: roleOption, parentId: '' }));
                        setEditRoleOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{roleOption}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>
            {['commercial', 'manager_adjoint', 'manager'].includes(editFormData.role) && (
              <>
                <Text style={styles.parentLabel}>{getEditParentLabel()}</Text>
                <TouchableOpacity
                  style={[styles.input, styles.dropdownTrigger]}
                  onPress={() => editPossibleParents.length > 0 && setEditParentOpen(true)}
                  activeOpacity={0.8}
                  disabled={editPossibleParents.length === 0}
                >
                  <Text style={styles.inputText}>
                    {editFormData.parentId
                      ? formatName(users.find(u => String(u.id) === editFormData.parentId)) || 'Sélectionné'
                      : editPossibleParents.length > 0
                        ? `Sélectionnez ${getEditParentLabel().toLowerCase()}`
                        : `Aucun ${getEditParentLabel().toLowerCase()} disponible`
                    }
                  </Text>
                  <Text style={styles.dropdownCaret}>▾</Text>
                </TouchableOpacity>
                <Modal transparent visible={editParentOpen} animationType="fade" onRequestClose={() => setEditParentOpen(false)}>
                  <TouchableOpacity style={styles.modalOverlay} onPress={() => setEditParentOpen(false)} activeOpacity={1}>
                    <View style={styles.dropdownBox}>
                      {editPossibleParents.map((parent, index) => (
                        <TouchableOpacity
                          key={parent.id ?? `parent-${index}`}
                          style={styles.dropdownItem}
                          onPress={() => {
                            if (parent.id) {
                              setEditFormData((prev) => ({ ...prev, parentId: parent.id! }));
                              setEditParentOpen(false);
                            }
                          }}
                        >
                          <Text style={styles.dropdownItemText}>
                            {formatName(parent)} - {parent.role}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </TouchableOpacity>
                </Modal>
              </>
            )}
            {['commercial', 'manager_adjoint', 'manager', 'chef_agence'].includes(editFormData.role) && (
              <>
                <Text style={styles.subTitle}>Objectif mensuel (FCFA)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Objectif mensuel (FCFA)"
                  value={editFormData.objectif_mensuel > 0 ? editFormData.objectif_mensuel.toLocaleString() : ''}
                  onChangeText={(t) => {
                    const cleanValue = t.replace(/[^0-9.]/g, '');
                    setEditFormData((prev) => ({ ...prev, objectif_mensuel: cleanValue ? parseFloat(cleanValue) || 5000000 : 5000000 }));
                  }}
                  keyboardType="numeric"
                  placeholderTextColor={colors.gray400}
                />
              </>
            )}
            <View style={styles.resetModalButtons}>
              <TouchableOpacity
                style={[styles.resetModalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.resetModalButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.resetModalButton, styles.confirmButton]}
                onPress={handleUpdateUser}
              >
                <Text style={styles.resetModalButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reset Password Confirmation Modal */}
      <Modal
        transparent
        visible={resetModalVisible}
        animationType="fade"
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resetModalBox}>
            <Text style={styles.resetModalTitle}>Réinitialiser le mot de passe</Text>
            <Text style={styles.resetModalText}>
              Êtes-vous sûr de vouloir réinitialiser le mot de passe?
            </Text>
            <Text style={styles.resetModalWarning}>
              Le nouveau mot de passe sera "Pass1234".
            </Text>
            <View style={styles.resetModalButtons}>
              <TouchableOpacity
                style={[styles.resetModalButton, styles.cancelButton]}
                onPress={() => setResetModalVisible(false)}
              >
                <Text style={styles.resetModalButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.resetModalButton, styles.confirmButton]}
                onPress={confirmResetPassword}
              >
                <Text style={styles.resetModalButtonText}>Réinitialiser</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Allocation Modal */}
      <Modal visible={allocationModalVisible} transparent animationType="fade" onRequestClose={() => setAllocationModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Allouer les objectifs</Text>
            <Text style={styles.modalText}>
              Répartir les objectifs mensuels depuis un chef d'agence vers ses commerciaux.
            </Text>

            {/* Manager Selection */}
            <Text style={styles.inputLabel}>Sélectionner un Manager</Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setAllocationManagerOpen(!allocationManagerOpen)}
            >
              <Text style={styles.inputText}>
                {allocationFormData.managerId
                  ? users.find(u => u.id === allocationFormData.managerId)?.name || 'Utilisateur inconnu'
                  : 'Sélectionner un manager'
                }
              </Text>
              <Text style={styles.dropdownCaret}>{allocationManagerOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {allocationManagerOpen && (
              <View style={styles.dropdownBox}>
                {users
                  .filter(u => u.role === 'manager' && u.active)
                  .map(manager => (
                    <TouchableOpacity
                      key={manager.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setAllocationFormData(prev => ({ ...prev, managerId: manager.id }));
                        setAllocationManagerOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{manager.name}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}

            {/* VIE Amount */}
            <Text style={styles.inputLabel}>Montant VIE (FCFA)</Text>
            <TextInput
              style={styles.input}
              value={allocationFormData.totalVie > 0 ? allocationFormData.totalVie.toLocaleString() : ''}
              onChangeText={(text) => {
                const cleanValue = text.replace(/[^0-9]/g, '');
                setAllocationFormData(prev => ({
                  ...prev,
                  totalVie: cleanValue ? parseFloat(cleanValue) || 0 : 0
                }));
              }}
              keyboardType="numeric"
              placeholder="Ex: 5000000"
              placeholderTextColor={colors.gray400}
            />

            {/* NON-VIE Amount */}
            <Text style={styles.inputLabel}>Montant NON-VIE (FCFA)</Text>
            <TextInput
              style={styles.input}
              value={allocationFormData.totalNonVie > 0 ? allocationFormData.totalNonVie.toLocaleString() : ''}
              onChangeText={(text) => {
                const cleanValue = text.replace(/[^0-9]/g, '');
                setAllocationFormData(prev => ({
                  ...prev,
                  totalNonVie: cleanValue ? parseFloat(cleanValue) || 0 : 0
                }));
              }}
              keyboardType="numeric"
              placeholder="Ex: 5000000"
              placeholderTextColor={colors.gray400}
            />

            {/* Month Selection */}
            <Text style={styles.inputLabel}>Mois</Text>
            <TextInput
              style={styles.input}
              value={allocationFormData.mois}
              onChangeText={(text) => setAllocationFormData(prev => ({ ...prev, mois: text }))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.gray400}
            />

            <Text style={styles.modalText}>
              Total: {(allocationFormData.totalVie + allocationFormData.totalNonVie).toLocaleString()} FCFA
            </Text>

            <View style={styles.resetModalButtons}>
              <TouchableOpacity
                style={[styles.resetModalButton, styles.cancelButton]}
                onPress={() => setAllocationModalVisible(false)}
              >
                <Text style={styles.resetModalButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.resetModalButton, { backgroundColor: colors.success }]}
                onPress={handleAllocateObjectives}
              >
                <Text style={styles.resetModalButtonText}>Allouer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  inputText: { fontSize: 14, color: colors.gray800 },
  
  button: { marginTop: spacing.xs, backgroundColor: colors.violet, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: 'center' },
  buttonText: { color: colors.white, fontWeight: '700' },
  
  createButton: { marginTop: spacing.lg, backgroundColor: colors.orange, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: 'center' },
  createButtonText: { color: colors.white, fontWeight: '700' },

  userRow: { backgroundColor: colors.white, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.gray100, padding: spacing.sm, marginBottom: spacing.xs },
  userInfo: { flex: 1 },
  userText: { fontSize: 13, color: colors.gray800, fontWeight: '600' },
  userMeta: { fontSize: 11, color: colors.gray400 },
  userActions: { flexDirection: 'row', gap: spacing.xs },
  actionButton: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.xs, minWidth: 70, alignItems: 'center' },
  actionButtonText: { fontSize: 11, fontWeight: '600', color: colors.white },
  activateButton: { backgroundColor: colors.success },
  deactivateButton: { backgroundColor: colors.danger },
  resetButton: { backgroundColor: colors.orange },
  editButton: { backgroundColor: colors.violet },

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
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.gray700, marginBottom: spacing.xs, marginTop: spacing.sm },
  dropdownCaret: { fontSize: 16, color: colors.gray400 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: spacing.xl },
  modalContent: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.xl, marginHorizontal: spacing.xl, maxWidth: 400, alignSelf: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.violetDark, marginBottom: spacing.sm },
  modalText: { fontSize: 14, color: colors.gray600, marginBottom: spacing.md },
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

  resetModalBox: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    padding: spacing.xl,
    minWidth: 300,
    maxWidth: 400,
    alignSelf: 'center',
  },
  editModalBox: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    padding: spacing.xl,
    minWidth: 320,
    maxWidth: 420,
    alignSelf: 'center',
  },
  resetModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.violetDark,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  resetModalText: {
    fontSize: 16,
    color: colors.gray800,
    marginBottom: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  resetModalWarning: {
    fontSize: 14,
    color: colors.danger,
    marginBottom: spacing.lg,
    textAlign: 'center',
    fontWeight: '600',
  },
  resetModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  resetModalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  resetModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  cancelButton: {
    backgroundColor: colors.gray400,
  },
  confirmButton: {
    backgroundColor: colors.danger,
  },
});