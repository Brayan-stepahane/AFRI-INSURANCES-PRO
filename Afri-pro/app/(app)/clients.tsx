import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Modal, TextInput,
  TouchableOpacity, Pressable, ScrollView, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { useClients } from '../../src/hooks/useClients';
import { colors, spacing, radius } from '../../src/config/theme';
import { Client } from '../../src/types';
import apiClient from '../../src/services/api/client';
import { API_ENDPOINTS } from '../../src/services/api/endpoints';

export default function ClientsScreen() {
  const { user } = useAuth();
  const { clients, loading, refetch } = useClients();
  const role = user?.role ?? 'commercial';
  const allowed = ['admin', 'chef', 'commercial'];
  const [showClientModal, setShowClientModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newClient, setNewClient] = useState({
    nom: '',
    telephone: '',
    activite: '',
    type_client: 'Particulier',
    email: '',
    ville: '',
  });

  const updateNewClient = (field: keyof typeof newClient, value: string) => {
    setNewClient(prev => ({ ...prev, [field]: value }));
  };

  const resetNewClientForm = () => {
    setNewClient({
      nom: '',
      telephone: '',
      activite: '',
      type_client: 'Particulier',
      email: '',
      ville: '',
    });
    setCreateError('');
  };

  const handleCreateClient = async () => {
    if (!newClient.nom.trim()) {
      setCreateError('Le nom du client est requis.');
      return;
    }

    setIsSubmitting(true);
    setCreateError('');

    try {
      const response = await apiClient.post(API_ENDPOINTS.CLIENTS.LIST, newClient);
      if (response?.data) {
        refetch();
        resetNewClientForm();
        setShowClientModal(false);
      }
    } catch (error) {
      console.error('Error creating client:', error);
      setCreateError('Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!allowed.includes(role)) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Accès refusé</Text>
        <Text style={styles.text}>Vous n'avez pas l'autorisation d'accéder à la base clients.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Base clients</Text>
      <Text style={styles.text}>{clients.length} clients enregistrés</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.violet} />
        </View>
      ) : clients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun client enregistré</Text>
        </View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item: Client) => item.id}
          renderItem={({ item }: { item: Client }) => (
            <View style={styles.clientCard}>
              <Text style={styles.clientName}>{item.nom}</Text>
              <Text style={styles.clientMeta}>ID: {item.id}</Text>
              {item.telephone && <Text style={styles.clientMeta}>Tel: {item.telephone}</Text>}
              {item.activite && <Text style={styles.clientMeta}>Activité: {item.activite}</Text>}
              {item.type_client && <Text style={styles.clientMeta}>Type: {item.type_client}</Text>}
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => { resetNewClientForm(); setShowClientModal(true); }}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showClientModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowClientModal(false)} />
          <View style={styles.clientModal}>
            <Text style={styles.modalTitle}>Nouveau client</Text>
            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                value={newClient.nom}
                onChangeText={value => updateNewClient('nom', value)}
                placeholder="Nom du client"
                placeholderTextColor={colors.gray400}
              />
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={newClient.telephone}
                onChangeText={value => updateNewClient('telephone', value)}
                placeholder="Téléphone"
                placeholderTextColor={colors.gray400}
                keyboardType="phone-pad"
              />
              <Text style={styles.label}>Activité</Text>
              <TextInput
                style={styles.input}
                value={newClient.activite}
                onChangeText={value => updateNewClient('activite', value)}
                placeholder="Activité"
                placeholderTextColor={colors.gray400}
              />
              <Text style={styles.label}>Type de client</Text>
              <TextInput
                style={styles.input}
                value={newClient.type_client}
                onChangeText={value => updateNewClient('type_client', value)}
                placeholder="Particulier, PME, Entreprise..."
                placeholderTextColor={colors.gray400}
              />
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={newClient.email}
                onChangeText={value => updateNewClient('email', value)}
                placeholder="Email"
                placeholderTextColor={colors.gray400}
                keyboardType="email-address"
              />
              <Text style={styles.label}>Ville</Text>
              <TextInput
                style={styles.input}
                value={newClient.ville}
                onChangeText={value => updateNewClient('ville', value)}
                placeholder="Ville"
                placeholderTextColor={colors.gray400}
              />
              {createError ? <Text style={styles.errorText}>{createError}</Text> : null}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowClientModal(false)}>
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveButton, isSubmitting && styles.disabledButton]} onPress={handleCreateClient} disabled={isSubmitting}>
                  <Text style={styles.saveButtonText}>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50, padding: spacing.xl },
  title: { fontSize: 22, fontWeight: '700', color: colors.violetDark, marginBottom: spacing.sm },
  text: { fontSize: 14, color: colors.gray600, marginBottom: spacing.md },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.gray400 },
  list: { paddingBottom: spacing.xl },
  clientCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.gray100 },
  clientName: { fontSize: 15, fontWeight: '700', color: colors.violetDark, marginBottom: 4 },
  clientMeta: { fontSize: 12, color: colors.gray600 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', elevation: 6, boxShadow: '0px 4px 10px rgba(232,82,26,0.4)' },
  fabText: { fontSize: 28, color: colors.white, fontWeight: '300', lineHeight: 32 },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  clientModal: { width: '90%', maxWidth: 520, maxHeight: '85%', backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.violetDark, padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  modalContent: { padding: spacing.xl },
  label: { fontSize: 13, fontWeight: '600', color: colors.gray800, marginTop: spacing.sm, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, color: colors.gray800, backgroundColor: colors.white, marginBottom: spacing.md },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md, marginTop: spacing.sm, marginBottom: spacing.md },
  cancelButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  cancelButtonText: { fontSize: 14, fontWeight: '600', color: colors.gray600 },
  saveButton: { backgroundColor: colors.violet, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.sm },
  saveButtonText: { fontSize: 14, fontWeight: '600', color: colors.white },
  disabledButton: { opacity: 0.6 },
  errorText: { fontSize: 13, color: colors.danger, marginTop: spacing.sm, marginBottom: spacing.md },
});
