import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput,
  TouchableOpacity, RefreshControl, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { getCotationsForUser, getClient, fmt, fmtDate, cotations, prospections } from '../../src/store/data';
import { colors, spacing, radius, STATUT_BADGE_COLORS } from '../../src/config/theme';
import { Badge, EmptyState, ClientIdBadge, StatCard } from '../../src/components/common/Button';
import { Header } from '../../src/components/common/Header';
import { STATUTS_COT } from '../../src/store/data';
import { Cotation } from '../../src/types';

export default function CotationsScreen() {
  const { user } = useAuth();
  const router   = useRouter();
  const [search, setSearch]   = useState('');
  const [statut, setStatut]   = useState('Tous');
  const [refreshing, setRefreshing] = useState(false);

  const name = user?.name ?? '';
  const role = user?.role ?? 'commercial';
  let list = getCotationsForUser(name, role);

  if (statut !== 'Tous') list = list.filter(c => c.statut === statut);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(c => {
      const cli = getClient(c.clientId);
      return (cli?.nom || '').toLowerCase().includes(q) || c.risqueCote.toLowerCase().includes(q);
    });
  }

  const enAttente   = getCotationsForUser(name, role).filter(c => c.statut === 'En attente').length;
  const converties  = getCotationsForUser(name, role).filter(c => c.statut === 'Convertie en vente').length;

  const filters = ['Tous', ...STATUTS_COT];

  const validerCotation = (cot: Cotation) => {
    Alert.alert('Valider la cotation', `Confirmer la validation de COT-${String(cot.noCot).padStart(3,'0')} pour ${fmt(cot.montant)} FCFA ?`,
      [{ text: 'Annuler', style: 'cancel' },
       { text: 'Valider', onPress: () => {
          const idx = cotations.findIndex(c => c.id === cot.id);
          if (idx >= 0) { cotations[idx].statut = 'Validée'; cotations[idx].dateValidation = new Date().toISOString().split('T')[0]; }
          const pi = prospections.findIndex(p => p.id === cot.prospId);
          if (pi >= 0 && prospections[pi].statut === 'Cotation envoyée') prospections[pi].statut = 'En attente signature';
          Alert.alert('✅', 'Cotation validée !');
       }}]);
  };

  const refuserCotation = (cot: Cotation) => {
    Alert.alert('Refuser', `Marquer COT-${String(cot.noCot).padStart(3,'0')} comme refusée ?`,
      [{ text: 'Annuler', style: 'cancel' },
       { text: 'Refuser', style: 'destructive', onPress: () => {
          const idx = cotations.findIndex(c => c.id === cot.id);
          if (idx >= 0) cotations[idx].statut = 'Refusée';
          const pi = prospections.findIndex(p => p.id === cot.prospId);
          if (pi >= 0) prospections[pi].statut = 'Perdu';
       }}]);
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
        <StatCard label="Total" value={getCotationsForUser(name, role).length} valueColor={colors.teal} />
        <View style={{ width: spacing.md }} />
        <StatCard label="En attente" value={enAttente} subtext="à valider" valueColor={colors.warning} />
        <View style={{ width: spacing.md }} />
        <StatCard label="Converties" value={converties} valueColor={colors.success} />
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <TextInput style={styles.searchInput} placeholder="Rechercher..." value={search} onChangeText={setSearch} placeholderTextColor={colors.gray400} />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.md }}>
        {filters.map(f => (
          <TouchableOpacity key={f} style={[styles.chip, statut === f && styles.chipActive]} onPress={() => setStatut(f)}>
            <Text style={[styles.chipText, statut === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {enAttente > 0 && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>💼  {enAttente} cotation(s) en attente de réponse du prospect</Text>
        </View>
      )}

      <FlatList
        data={list}
        keyExtractor={c => String(c.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 600); }} />}
        ListEmptyComponent={<EmptyState icon="💼" title="Aucune cotation trouvée" sub="Les cotations apparaissent ici une fois saisies" />}
      />

        {/* FAB */}
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/(app)/cotations/new' as any)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  statsRow: { flexDirection: 'row', padding: spacing.xl, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  searchBar: { backgroundColor: colors.white, padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  searchInput: { backgroundColor: colors.gray50, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: colors.gray800 },
  filterRow: { backgroundColor: colors.white, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100, flexGrow: 0 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: colors.gray200 },
  chipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipText: { fontSize: 12, color: colors.gray600 },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  alertBanner: { backgroundColor: colors.warningBg, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: '#e8c97a' },
  alertText: { fontSize: 13, color: colors.warning, fontWeight: '600' },
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.xl, marginBottom: spacing.lg, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  cardPending: { borderLeftWidth: 3, borderLeftColor: colors.warning },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  noContainer: { backgroundColor: colors.tealBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.sm },
  noCot: { fontSize: 12, fontWeight: '700', color: colors.teal, fontVariant: ['tabular-nums'] },
  clientNom: { fontSize: 14, fontWeight: '600', color: colors.gray800, marginBottom: 3 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.gray100 },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 10, color: colors.gray400, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 },
  detailValue: { fontSize: 13, fontWeight: '500', color: colors.gray800 },
  validationDate: { fontSize: 12, color: colors.success, marginBottom: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap', marginTop: spacing.md },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.sm, borderWidth: 1 },
  actionValidate: { backgroundColor: colors.tealBg, borderColor: colors.teal },
  actionRefuse: { backgroundColor: colors.dangerBg, borderColor: '#f5c0c0' },
  actionConvert: { backgroundColor: colors.orange, borderColor: colors.orange, flex: 1 },
  actionView: { backgroundColor: colors.violetPale, borderColor: colors.violetLight },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: colors.teal },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabText: { fontSize: 28, color: colors.white, fontWeight: '300', lineHeight: 32 },
});
