import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput,
  TouchableOpacity, RefreshControl, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useCotations } from '../../src/hooks/useCotations';
import { useClients } from '../../src/hooks/useClients';
import { fmt, fmtDate, STATUTS_COT } from '../../src/utils/constants';
import { colors, spacing, radius, STATUT_BADGE_COLORS } from '../../src/config/theme';
import { Badge, EmptyState, ClientIdBadge, StatCard } from '../../src/components/common/Button';
import { Header } from '../../src/components/common/Header';
import { Cotation } from '../../src/types';
import { NewCotationModal } from '../../src/components/modals/NewCotationModal';
import apiClient from '../../src/services/api/client';
import { API_ENDPOINTS } from '../../src/services/api/endpoints';

export default function CotationsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { cotations, loading, refetch } = useCotations();
  const { clients } = useClients();
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('Tous');
  const [refreshing, setRefreshing] = useState(false);
  const [showNewCotationModal, setShowNewCotationModal] = useState(false);
  const [editingCotation, setEditingCotation] = useState<Cotation | null>(null);

  const name = user?.name ?? '';
  const role = user?.role ?? 'commercial';

  // Helper function to get client by ID
  const getClient = (id: string) => clients.find(c => c.id === id);

  let list = cotations;

  if (statut !== 'Tous') list = list.filter(c => c.statut === statut);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(c => {
      const cli = getClient(c.clientId);
      const riskField = c.risqueCote?.toLowerCase() || '';
      return (cli?.nom || '').toLowerCase().includes(q) || riskField.includes(q);
    });
  }

  const allCotations = cotations;
  const totalCount = allCotations.length;
  const enAttente = allCotations.filter(c => c.statut === 'En attente').length;
  const validees = allCotations.filter(c => c.statut === 'Validée').length;
  const converties = allCotations.filter(c => c.statut === 'Convertie en vente').length;
  const refusees = allCotations.filter(c => c.statut === 'Refusée').length;

  const filters = ['Tous', ...STATUTS_COT];

  const validerCotation = async (cot: Cotation) => {
    Alert.alert('Valider la cotation', `Confirmer la validation de COT-${String(cot.noCot).padStart(3,'0')} pour ${fmt(cot.montant)} FCFA ?`,
      [{ text: 'Annuler', style: 'cancel' },
       { text: 'Valider', onPress: async () => {
          try {
            await apiClient.put(`${API_ENDPOINTS.COTATIONS.LIST}/${cot.id}`, {
              statut: 'Validée',
              date_validation: new Date().toISOString().split('T')[0]
            });
            refetch();
            Alert.alert('✅', 'Cotation validée !');
          } catch (error) {
            console.error('Error validating cotation:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la validation.');
          }
       }}]);
  };

  const refuserCotation = async (cot: Cotation) => {
    Alert.alert('Refuser', `Marquer COT-${String(cot.noCot).padStart(3,'0')} comme refusée ?`,
      [{ text: 'Annuler', style: 'cancel' },
       { text: 'Refuser', style: 'destructive', onPress: async () => {
          try {
            await apiClient.put(`${API_ENDPOINTS.COTATIONS.LIST}/${cot.id}`, {
              statut: 'Refusée'
            });
            // Also update prospection status to 'Perdu'
            await apiClient.put(`${API_ENDPOINTS.PROSPECTIONS.LIST}/${cot.prospId}`, {
              status: 'Perdu'
            });
            refetch();
          } catch (error) {
            console.error('Error refusing cotation:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors du refus.');
          }
       }}]);
  };

  const deleteCotation = async (cot: Cotation) => {
    Alert.alert(
      'Supprimer la cotation',
      `Êtes-vous sûr de vouloir supprimer COT-${String(cot.noCot).padStart(3,'0')} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`${API_ENDPOINTS.COTATIONS.LIST}/${cot.id}`);
              refetch();
            } catch (error) {
              console.error('Error deleting cotation:', error);
              Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression.');
            }
          }
        }
      ]
    );
  };

  const handleCotationSubmit = async (data: any, isEdit?: boolean, cotationId?: number, options?: { refreshOnly?: boolean }) => {
    if (options?.refreshOnly) {
      refetch();
      return;
    }

    try {
      if (isEdit && cotationId) {
        // Update existing cotation - already handled in modal
        refetch();
      } else {
        // Create new cotation - call POST API
        const apiData = {
          prospection_id: data.prospectionId || null,
          client_id: data.clientId,
          risque_cote: data.risqueCote,
          date_cotation: data.dateCotation,
          montant: Number(data.montant) || 0,
        };
        await apiClient.post(API_ENDPOINTS.COTATIONS.LIST, apiData);
      }
      refetch();
      setShowNewCotationModal(false);
      setEditingCotation(null);
    } catch (error) {
      console.error('Error submitting cotation:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'enregistrement');
    }
  };

  const renderItem = ({ item: c }: { item: Cotation }) => {
    const cli = getClient(c.clientId);
    const sc  = STATUT_BADGE_COLORS[c.statut] ?? { bg: colors.gray100, text: colors.gray600 };
    return (
      <View style={[styles.card, c.statut === 'En attente' && styles.cardPending]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.noContainer}>
            <Text style={styles.noCot}>COT-{String(c.noCot).padStart(3, '0')}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: spacing.lg }}>
            <Text style={styles.clientNom}>{cli?.nom || c.clientId}</Text>
            <ClientIdBadge id={c.clientId} />
          </View>
          <Badge label={c.statut} bg={sc.bg} text={sc.text} small />
        </View>

        {/* Details */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Risque coté</Text>
            <Text style={styles.detailValue}>{c.risqueCote}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Montant</Text>
            <Text style={[styles.detailValue, { color: colors.teal, fontWeight: '700' }]}>{fmt(c.montant)} FCFA</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{fmtDate(c.dateCotation)}</Text>
          </View>
        </View>

        {c.dateValidation ? (
          <Text style={styles.validationDate}>✅ Validée le {fmtDate(c.dateValidation)}</Text>
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          {c.statut === 'En attente' && (
            <>
              <TouchableOpacity style={[styles.actionBtn, styles.actionValidate]} onPress={() => validerCotation(c)}>
                <Text style={styles.actionBtnText}>✓ Valider</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.actionRefuse]} onPress={() => refuserCotation(c)}>
                <Text style={[styles.actionBtnText, { color: colors.danger }]}>Refuser</Text>
              </TouchableOpacity>
            </>
          )}
          {c.statut === 'Validée' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionConvert]}
              onPress={() => router.push(`/(app)/ventes/new?cotId=${c.id}` as any)}
            >
              <Text style={styles.actionBtnText}>→ Convertir en vente</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.actionBtn, styles.actionEdit]} onPress={() => setEditingCotation(c)}>
            <Text style={styles.actionBtnText}>✏️ Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionDelete]} onPress={() => deleteCotation(c)}>
            <Text style={[styles.actionBtnText, { color: colors.danger }]}>🗑️ Supprimer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionView]} onPress={() => router.push(`/(app)/cotations/${c.id}` as any)}>
            <Text style={[styles.actionBtnText, { color: colors.violet }]}>👁️ Détail</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Cotations" subtitle={`${list.length} cotation(s)`} />

      {/* Stats strip */}
      <View style={styles.statsRow}>
        <StatCard label="Total" value={totalCount} valueColor={colors.teal} />
        <View style={{ width: spacing.md }} />
        <StatCard label="En attente" value={enAttente} subtext="à valider" valueColor={colors.warning} />
        <View style={{ width: spacing.md }} />
        <StatCard label="Validées" value={validees} valueColor={colors.success} />
        <View style={{ width: spacing.md }} />
        <StatCard label="Converties" value={converties} valueColor={colors.success} />
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.gray400}
        />
      </View>

      {/* ✅ FIXED: Filters — outer View handles bg/border, ScrollView only scrolls */}
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

      {(() => {
        let msg = '';
        if (statut === 'Tous') {
          msg = `${enAttente} cotation(s) en attente de réponse du prospect`;
        } else if (statut === 'En attente') {
          msg = `${enAttente} cotation(s) en attente de validation`;
        } else if (statut === 'Validée') {
          msg = `${validees} cotation(s) validée(s)`;
        } else if (statut === 'Convertie en vente') {
          msg = `${converties} cotation(s) convertie(s)`;
        } else if (statut === 'Refusée') {
          msg = `${refusees} cotation(s) refusée(s)`;
        }

        if (!msg) return null;

        return (
          <View style={styles.alertBanner}>
            <Text style={styles.alertText}>💼  {msg}</Text>
          </View>
        );
      })()}

      <FlatList
        data={list}
        keyExtractor={c => String(c.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); refetch(); setTimeout(() => setRefreshing(false), 600); }} />}
        ListEmptyComponent={<EmptyState icon="💼" title="Aucune cotation trouvée" sub="Les cotations apparaissent ici une fois saisies" />}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/cotations/new' as any)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <NewCotationModal
        visible={!!editingCotation}
        onClose={() => setEditingCotation(null)}
        onSubmit={handleCotationSubmit}
        editCotation={editingCotation as any}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.gray50 },
  statsRow:       { flexDirection: 'row', padding: spacing.xl, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  searchBar:      { backgroundColor: colors.white, padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  searchInput:    { backgroundColor: colors.gray50, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: colors.gray800 },

  // ✅ FIXED: wrapper View owns the background, border, and visible overflow
  filterWrapper:  { backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray100 },

  // ✅ FIXED: filterRow is now contentContainerStyle — only padding & layout, no clipping
  filterRow:      { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.md, flexDirection: 'row', alignItems: 'center' },

  chip:           { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: colors.gray200 },
  chipActive:     { backgroundColor: colors.teal, borderColor: colors.teal },
  chipText:       { fontSize: 12, color: colors.gray600 },
  chipTextActive: { color: colors.white, fontWeight: '600' },

  alertBanner:    { backgroundColor: colors.warningBg, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: '#e8c97a' },
  alertText:      { fontSize: 13, color: colors.warning, fontWeight: '600' },
  card:           { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.xl, marginBottom: spacing.lg, elevation: 2, boxShadow: '0px 2px 6px rgba(0,0,0,0.05)' },
  cardPending:    { borderLeftWidth: 3, borderLeftColor: colors.warning },
  cardHeader:     { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  noContainer:    { backgroundColor: colors.tealBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.sm },
  noCot:          { fontSize: 12, fontWeight: '700', color: colors.teal, fontVariant: ['tabular-nums'] },
  clientNom:      { fontSize: 14, fontWeight: '600', color: colors.gray800, marginBottom: 3 },
  detailsRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.gray100 },
  detailItem:     { flex: 1 },
  detailLabel:    { fontSize: 10, color: colors.gray400, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 },
  detailValue:    { fontSize: 13, fontWeight: '500', color: colors.gray800 },
  validationDate: { fontSize: 12, color: colors.success, marginBottom: spacing.md },
  actions:        { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap', marginTop: spacing.md },
  actionBtn:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.sm, borderWidth: 1 },
  actionValidate: { backgroundColor: colors.tealBg, borderColor: colors.teal },
  actionRefuse:   { backgroundColor: colors.dangerBg, borderColor: '#f5c0c0' },
  actionConvert:  { backgroundColor: colors.orange, borderColor: colors.orange, flex: 1 },
  actionEdit:     { backgroundColor: colors.violetPale, borderColor: colors.violetLight },
  actionDelete:   { backgroundColor: colors.dangerBg, borderColor: '#f5c0c0' },
  actionView:     { backgroundColor: colors.violetPale, borderColor: colors.violetLight },
  actionBtnText:  { fontSize: 12, fontWeight: '600', color: colors.teal },
  fab:            { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabText:        { fontSize: 28, color: colors.white, fontWeight: '300', lineHeight: 32 },
});