import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput,
  TouchableOpacity, RefreshControl, ScrollView, Alert,
} from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { useVentes } from '../../src/hooks/useVentes';
import { useClients } from '../../src/hooks/useClients';
import { fmt, fmtDate } from '../../src/utils/constants';
import { colors, spacing, radius } from '../../src/config/theme';
import { Badge, EmptyState, ClientIdBadge, StatCard } from '../../src/components/common/Button';
import { Header } from '../../src/components/common/Header';
import { Vente } from '../../src/types';
import { NewVenteModal } from '../../src/components/modals/NewVenteModal';
import apiClient from '../../src/services/api/client';
import { API_ENDPOINTS } from '../../src/services/api/endpoints';

export default function VentesScreen() {
  const { user }  = useAuth();
  const { ventes, refetch } = useVentes();
  const { clients } = useClients();
  const [search, setSearch]   = useState('');
  const [filterMois, setFilterMois] = useState('Tous');
  const [refreshing, setRefreshing] = useState(false);

  const getClient = (id: string) => clients.find(c => c.id === id);
  const [editingVente, setEditingVente] = useState<Vente | null>(null);

  const name = user?.name ?? '';
  const role = user?.role ?? 'commercial';
  const allVentes = ventes;

  // Months available
  const mois = ['Tous', ...Array.from(new Set(
    allVentes.map((v: any) => v.dateVente?.slice(0, 7)).filter(Boolean)
  )).sort().reverse()];

  let list = allVentes;
  if (filterMois !== 'Tous') list = list.filter((v: any) => v.dateVente?.startsWith(filterMois));
  if (search) {
    const q = search.toLowerCase();
    list = list.filter((v: any) => {
      const cli = getClient(v.clientId);
      return (cli?.nom || '').toLowerCase().includes(q) || v.produit.toLowerCase().includes(q);
    });
  }

  const totalPrimes = list.reduce((s: number, v: any) => s + (v.primeNette || 0), 0);
  const totalAcc    = list.reduce((s: number, v: any) => s + (v.accessoires || 0), 0);
  const totalCA     = totalPrimes + totalAcc;

  const deleteVente = async (v: Vente) => {
    console.log('DELETE BUTTON PRESSED', v.id);
    Alert.alert(
      'Supprimer la vente',
      `Êtes-vous sûr de vouloir supprimer cette vente de ${getClient(v.clientId)?.nom || v.clientId} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiClient.delete(`${API_ENDPOINTS.VENTES.LIST}/${v.id}`);
              console.log('Delete response:', response.data);
              await refetch();
              Alert.alert('✅ Supprimé', 'La vente a bien été supprimée de la base de données.');
            } catch (error: any) {
              console.error('Delete error:', error?.response?.data || error?.message || error);
              Alert.alert('❌ Erreur', error?.response?.data?.error || 'Une erreur est survenue lors de la suppression.');
            }
          }
        }
      ]
    );
  };

  const handleVenteSubmit = async (data: any, isEdit?: boolean, venteId?: number, options?: { refreshOnly?: boolean }) => {
    if (options?.refreshOnly) {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 100);
      return;
    }

    try {
      if (isEdit && venteId) {
        // Update existing vente - already handled in modal
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 100);
      } else {
        // Create new vente - call POST API
        const apiData = {
          prospection_id: data.prospectionId || null,
          cotation_id: data.cotationId || null,
          client_id: data.clientId,
          date_vente: data.dateVente,
          type_vente: data.typeVente.includes('Nouvelle') ? 'NouVe' : 'VenRec',
          no_police: data.noPolice,
          prime_nette: Number(data.primeNette) || 0,
          accessoires: Number(data.accessories) || 0,
          no_attestation: data.noAttestation,
          no_carte_rose: data.noCarteRose,
          date_effet: data.dateEffet,
          date_echeance: data.dateEcheance,
        };
        const response = await apiClient.post(API_ENDPOINTS.VENTES.LIST, apiData);
        console.log('Created vente:', response.data);
        if (response?.data && response.data.id) {
          ventes.unshift(response.data);
        }
      }
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 100);
    } catch (error) {
      console.error('Error submitting vente:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'enregistrement');
    }
  };

  const renderItem = ({ item: v, index }: { item: Vente; index: number }) => {
    const cli = getClient(v.clientId);
    return (
      <View style={styles.card}>
        {/* Row 1 : numero + client + type */}
        <View style={styles.cardHeader}>
          <View style={styles.numBadge}>
            <Text style={styles.numText}>#{index + 1}</Text>
          </View>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{(cli?.nom || '?')[0]}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.clientNom}>{cli?.nom || v.clientId}</Text>
            <ClientIdBadge id={v.clientId} />
          </View>
          <Badge
            label={v.typeVente}
            bg={colors.successBg}
            text={colors.success}
            small
          />
        </View>

        {/* Produit */}
        <Text style={styles.produit}>{v.produit}</Text>

        {/* Montants */}
        <View style={styles.montantsRow}>
          <View style={styles.montantItem}>
            <Text style={styles.montantLabel}>Prime nette</Text>
            <Text style={styles.montantValue}>{fmt(v.primeNette)} FCFA</Text>
          </View>
          {v.accessoires > 0 && (
            <View style={styles.montantItem}>
              <Text style={styles.montantLabel}>Accessoires</Text>
              <Text style={styles.montantValue}>{fmt(v.accessoires)} FCFA</Text>
            </View>
          )}
          <View style={styles.montantItem}>
            <Text style={styles.montantLabel}>CA total</Text>
            <Text style={[styles.montantValue, { color: colors.orange, fontWeight: '700' }]}>
              {fmt(v.primeNette + (v.accessoires || 0))} FCFA
            </Text>
          </View>
        </View>

        {/* Dates + Police */}
        <View style={styles.datesRow}>
          <Text style={styles.dateText}>📅 Vente : {fmtDate(v.dateVente)}</Text>
          {v.dateEffet    ? <Text style={styles.dateText}>⚡ Effet : {fmtDate(v.dateEffet)}</Text>    : null}
          {v.dateEcheance ? <Text style={styles.dateText}>🔚 Échéance : {fmtDate(v.dateEcheance)}</Text> : null}
          {v.noPolice     ? <Text style={styles.dateText}>📄 Police : {v.noPolice}</Text>              : null}
          {v.noAttestation ? <Text style={styles.dateText}>📋 Attestation : {v.noAttestation}</Text>  : null}
          {v.noCarteRose  ? <Text style={styles.dateText}>🔴 Carte rose : {v.noCarteRose}</Text>       : null}
        </View>

        {/* Commercial (manager view) */}
        {role !== 'commercial' && (
          <Text style={styles.commercialText}>👤 {v.commercial}</Text>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.actionEdit]} onPress={() => setEditingVente(v)}>
            <Text style={styles.actionBtnText}>✏️ Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionDelete]} onPress={() => deleteVente(v)}>
            <Text style={[styles.actionBtnText, { color: colors.danger }]}>🗑️ Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Ventes réalisées" subtitle={`${list.length} vente(s)`} />

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        <View style={{ flex: 1 }}>
          <Text style={styles.statsLabel}>Primes nettes</Text>
          <Text style={[styles.statsValue, { color: colors.violetDark }]}>{fmt(totalPrimes)}</Text>
          <Text style={styles.statsUnit}>FCFA</Text>
        </View>
        <View style={styles.statsDivider} />
        <View style={{ flex: 1 }}>
          <Text style={styles.statsLabel}>Accessoires</Text>
          <Text style={[styles.statsValue, { color: colors.gray600 }]}>{fmt(totalAcc)}</Text>
          <Text style={styles.statsUnit}>FCFA</Text>
        </View>
        <View style={styles.statsDivider} />
        <View style={{ flex: 1 }}>
          <Text style={styles.statsLabel}>CA total</Text>
          <Text style={[styles.statsValue, { color: colors.orange }]}>{fmt(totalCA)}</Text>
          <Text style={styles.statsUnit}>FCFA</Text>
        </View>
        <View style={styles.statsDivider} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.statsLabel}>Ventes</Text>
          <Text style={[styles.statsValue, { color: colors.violet }]}>{allVentes.length}</Text>
        </View>
      </View>

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

      

      <FlatList
        data={list}
        keyExtractor={v => String(v.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 600); }}
          />
        }
        ListEmptyComponent={
          <EmptyState icon="✅" title="Aucune vente trouvée" sub="Modifiez vos filtres" />
        }
      />

      <NewVenteModal
        visible={!!editingVente}
        onClose={() => setEditingVente(null)}
        onSubmit={handleVenteSubmit}
        editVente={editingVente as any}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  statsStrip: {
    flexDirection: 'row', backgroundColor: colors.white,
    padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.gray100,
  },
  statsLabel: { fontSize: 10, color: colors.gray400, textTransform: 'uppercase', letterSpacing: 0.4 },
  statsValue: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  statsUnit:  { fontSize: 10, color: colors.gray400 },
  statsDivider: { width: 1, backgroundColor: colors.gray200, marginHorizontal: spacing.md },
  searchBar:   { backgroundColor: colors.white, padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  searchInput: { backgroundColor: colors.gray50, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: colors.gray800 },
  filterRow:   { backgroundColor: colors.white, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100, flexGrow: 0, marginTop: spacing.lg },
  chip:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: colors.gray200, backgroundColor: colors.white, marginRight: spacing.sm },
  chipActive:  { backgroundColor: colors.violet, borderColor: colors.violet },
  chipText:    { fontSize: 12, color: colors.gray600 },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  card: {
    backgroundColor: colors.white, borderRadius: radius.md,
    padding: spacing.xl, marginBottom: spacing.lg,
    elevation: 2, boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  numBadge:   { backgroundColor: colors.gray100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: spacing.md },
  numText:    { fontSize: 11, color: colors.gray600, fontWeight: '600' },
  avatarWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: colors.success },
  clientNom:  { fontSize: 14, fontWeight: '600', color: colors.gray800, marginBottom: 3 },
  produit:    { fontSize: 13, color: colors.gray600, marginBottom: spacing.lg, paddingLeft: 2 },
  montantsRow:{ flexDirection: 'row', gap: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.gray100, marginBottom: spacing.md },
  montantItem:{ flex: 1 },
  montantLabel:{ fontSize: 10, color: colors.gray400, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 },
  montantValue:{ fontSize: 12, fontWeight: '600', color: colors.violetDark },
  datesRow:   { gap: 4, marginTop: 4 },
  dateText:   { fontSize: 11, color: colors.gray400 },
  commercialText: { fontSize: 12, color: colors.gray400, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.gray100 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.gray100 },
  actionBtn: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  actionEdit: { backgroundColor: colors.violetPale, borderWidth: 1, borderColor: colors.violet },
  actionDelete: { backgroundColor: colors.dangerBg, borderWidth: 1, borderColor: colors.danger },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: colors.violet },
});
