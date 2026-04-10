import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput,
  TouchableOpacity, RefreshControl, ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useProspections } from '../../src/hooks/useProspections';
import { useClients } from '../../src/hooks/useClients';
import { fmt, fmtDate, isOverdue, STATUTS_PROSP } from '../../src/utils/constants';
import { colors, spacing, radius } from '../../src/config/theme';
import { Badge, EmptyState, ClientIdBadge } from '../../src/components/common/Button';
import { Header } from '../../src/components/common/Header';
import { STATUT_BADGE_COLORS } from '../../src/config/theme';
import { Prospection } from '../../src/types';
import { NewProspectionModal } from '../../src/components/modals/NewProspectionModal';
import apiClient from '../../src/services/api/client';
import { API_ENDPOINTS } from '../../src/services/api/endpoints';

export default function ProspectionsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { prospections, loading, refetch } = useProspections();
  const { clients } = useClients();
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('Tous');
  const [refreshing, setRefreshing] = useState(false);
  const [showNewProspectionModal, setShowNewProspectionModal] = useState(false);
  const [editingProspection, setEditingProspection] = useState<Prospection | null>(null);

  const name = user?.name ?? '';
  const role = user?.role ?? 'commercial';
  const canCreateProspection = ['commercial', 'manager_adj', 'manager', 'chef', 'admin'].includes(role);
  const canValidateProspection = ['manager_adj', 'manager', 'chef', 'admin'].includes(role);

  // Helper function to get client by ID
  const getClient = (id: string) => clients.find(c => c.id === id);

  let list = prospections;

  if (statut !== 'Tous') list = list.filter(p => p.statut === statut);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p => {
      const cli = getClient(p.clientId);
      return (cli?.nom || '').toLowerCase().includes(q) || p.produit.toLowerCase().includes(q);
    });
  }

  const urgentCount = list.filter(p =>
    p.dateRelance && isOverdue(p.dateRelance) &&
    !['Contrat conclu', 'Perdu'].includes(p.statut)
  ).length;

  const filters = ['Tous', ...STATUTS_PROSP];

  const renderItem = ({ item: p }: { item: Prospection }) => {
    const cli = getClient(p.clientId);
    const urgent = p.dateRelance && isOverdue(p.dateRelance) && !['Contrat conclu', 'Perdu'].includes(p.statut);
    const sc = STATUT_BADGE_COLORS[p.statut] ?? { bg: colors.gray100, text: colors.gray600 };

    return (
      <TouchableOpacity style={[styles.card, urgent && styles.cardUrgent]} onPress={() => router.push(`/(app)/prospections/${p.id}` as any)} activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(cli?.nom || '?')[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nom}>{cli?.nom || p.clientId}</Text>
            <ClientIdBadge id={p.clientId} />
          </View>
          <Badge label={p.statut} bg={sc.bg} text={sc.text} small />
        </View>

        <Text style={styles.produit}>{p.produit}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>Potentiel : <Text style={styles.footerBold}>{fmt(p.potentielCA)} FCFA</Text></Text>
          <Text style={styles.footerText}>Chance : {p.chance}%</Text>
          {urgent && <Text style={styles.urgentText}>⚠️ Relance en retard</Text>}
        </View>

        {p.dateRelance && (
          <Text style={[styles.relanceText, urgent && { color: colors.danger }]}>
            📅 Relance : {new Date(p.dateRelance).toLocaleDateString('fr-FR')}{urgent ? ' ⚠️' : ''}
          </Text>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.actionEdit]} onPress={() => setEditingProspection(p)}>
            <Text style={styles.actionBtnText}>✏️ Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionDelete]} onPress={() => deleteProspection(p)}>
            <Text style={[styles.actionBtnText, { color: colors.danger }]}>🗑️ Supprimer</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const handleNewProspectionSubmit = async (data: any, isEdit?: boolean, prospectionId?: number, options?: { refreshOnly?: boolean }) => {
    if (options?.refreshOnly) {
      refetch();
      return;
    }

    try {
      if (isEdit && prospectionId) {
        await apiClient.put(`${API_ENDPOINTS.PROSPECTIONS.LIST}/${prospectionId}`, data);
      } else {
        await apiClient.post(API_ENDPOINTS.PROSPECTIONS.CREATE, data);
      }
      refetch();
      setShowNewProspectionModal(false);
      setEditingProspection(null);
    } catch (error) {
      console.error('Error saving prospection:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde.');
    }
  };

  const deleteProspection = async (prospection: Prospection) => {
    Alert.alert(
      'Supprimer la prospection',
      `Êtes-vous sûr de vouloir supprimer la prospection de ${getClient(prospection.clientId)?.nom || prospection.clientId} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`${API_ENDPOINTS.PROSPECTIONS.LIST}/${prospection.id}`);
              refetch();
            } catch (error) {
              console.error('Error deleting prospection:', error);
              Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Prospections" subtitle={`${list.length} enregistrement(s)`} />

      {/* Search */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher client ou produit..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.gray400}
        />
      </View>

      {/* ✅ FIXED: outer View owns bg/border, ScrollView only scrolls */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, statut === f && styles.chipActive]}
              onPress={() => setStatut(f)}
            >
              <Text style={[styles.chipText, statut === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Urgent alert */}
      {urgentCount > 0 && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>⚠️  {urgentCount} relance(s) en retard</Text>
        </View>
      )}

      <FlatList
        data={list}
        keyExtractor={p => String(p.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); refetch(); setTimeout(() => setRefreshing(false), 600); }} />}
        ListEmptyComponent={<EmptyState icon="📋" title="Aucune prospection trouvée" sub="Modifiez vos filtres ou ajoutez une prospection" />}
      />

      {/* FAB */}
      {canCreateProspection ? (
        <TouchableOpacity style={styles.fab} onPress={() => setShowNewProspectionModal(true)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.noFabPlaceholder} />
      )}

      

      <NewProspectionModal
        visible={showNewProspectionModal || !!editingProspection}
        onClose={() => {
          setShowNewProspectionModal(false);
          setEditingProspection(null);
        }}
        onSubmit={handleNewProspectionSubmit}
        editProspection={editingProspection}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: colors.gray50 },
  searchBar:        { backgroundColor: colors.white, padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  searchInput:      { backgroundColor: colors.gray50, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: colors.gray800 },

  // ✅ FIXED: wrapper View handles background, border — no overflow clipping
  filterWrapper:    { backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray100 },

  // ✅ FIXED: filterRow is contentContainerStyle only — padding & layout, no bg/border
  filterRow:        { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.md, flexDirection: 'row', alignItems: 'center' },

  chip:             { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: colors.gray200, backgroundColor: colors.white },
  chipActive:       { backgroundColor: colors.violet, borderColor: colors.violet },
  chipText:         { fontSize: 12, color: colors.gray600 },
  chipTextActive:   { color: colors.white, fontWeight: '600' },
  alertBanner:      { backgroundColor: colors.dangerBg, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: '#f5c0c0' },
  alertText:        { fontSize: 13, color: colors.danger, fontWeight: '600' },
  card:             { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.xl, marginBottom: spacing.lg, elevation: 2, boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' },
  cardUrgent:       { borderLeftWidth: 3, borderLeftColor: colors.danger, backgroundColor: '#fff9f9' },
  cardHeader:       { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.md },
  avatar:           { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.violetPale, alignItems: 'center', justifyContent: 'center' },
  avatarText:       { fontSize: 15, fontWeight: '700', color: colors.violet },
  nom:              { fontSize: 14, fontWeight: '600', color: colors.gray800, marginBottom: 3 },
  produit:          { fontSize: 13, color: colors.gray600, marginBottom: spacing.md },
  cardFooter:       { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
  footerText:       { fontSize: 11, color: colors.gray600 },
  footerBold:       { fontWeight: '700', color: colors.violetDark },
  urgentText:       { fontSize: 11, color: colors.danger, fontWeight: '600' },
  relanceText:      { fontSize: 11, color: colors.gray400, marginTop: spacing.sm },
  actions:          { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap', marginTop: spacing.md },
  actionBtn:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.sm, borderWidth: 1 },
  actionEdit:       { backgroundColor: colors.violetPale, borderColor: colors.violetLight },
  actionDelete:     { backgroundColor: colors.dangerBg, borderColor: '#f5c0c0' },
  actionBtnText:    { fontSize: 12, fontWeight: '600', color: colors.violet },
  fab:              { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', elevation: 6, boxShadow: '0px 4px 10px rgba(232,82,26,0.4)' },
  fabText:          { fontSize: 28, color: colors.white, fontWeight: '300', lineHeight: 32 },
  noFabPlaceholder: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56 },
  validationBanner: { position: 'absolute', bottom: 94, right: 16, left: 16, backgroundColor: colors.violetPale, borderRadius: radius.sm, padding: spacing.sm, borderWidth: 1, borderColor: colors.violet },
  validationText:   { fontSize: 12, color: colors.violetDark, fontWeight: '600', textAlign: 'center' },
});