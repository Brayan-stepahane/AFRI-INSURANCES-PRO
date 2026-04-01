import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput,
  TouchableOpacity, RefreshControl, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { getProspectionsForUser, getClient, isOverdue, fmt } from '../../src/store/data';
import { colors, spacing, radius } from '../../src/config/theme';
import { Badge, EmptyState, ClientIdBadge } from '../../src/components/common/Button';
import { AppWrapper } from '../../src/components/common/AppWrapper';
import { Header } from '../../src/components/common/Header';
import { STATUT_BADGE_COLORS } from '../../src/config/theme';
import { STATUTS_PROSP } from '../../src/store/data';
import { Prospection } from '../../src/types';

export default function ProspectionsScreen() {
  const { user } = useAuth();
  const router   = useRouter();
  const [search, setSearch]       = useState('');
  const [statut, setStatut]       = useState('Tous');
  const [refreshing, setRefreshing] = useState(false);

  const name = user?.name ?? '';
  const role = user?.role ?? 'commercial';
  let list = getProspectionsForUser(name, role);

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
    const urgent = p.dateRelance && isOverdue(p.dateRelance) &&
      !['Contrat conclu', 'Perdu'].includes(p.statut);
    const sc = STATUT_BADGE_COLORS[p.statut] ?? { bg: colors.gray100, text: colors.gray600 };

    return (
      <TouchableOpacity
        style={[styles.card, urgent && styles.cardUrgent]}
        onPress={() => router.push(`/(app)/prospections/${p.id}` as any)}
        activeOpacity={0.8}
      >
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
          <Text style={styles.footerText}>
            Potentiel : <Text style={styles.footerBold}>{fmt(p.potentielCA)} FCFA</Text>
          </Text>
          <Text style={styles.footerText}>Chance : {p.chance}%</Text>
          {urgent && <Text style={styles.urgentText}>⚠️ Relance en retard</Text>}
        </View>

        {p.dateRelance ? (
          <Text style={[styles.relanceText, urgent && { color: colors.danger }]}>
            📅 Relance : {p.dateRelance ? new Date(p.dateRelance).toLocaleDateString('fr-FR') : '—'}
            {urgent ? ' ⚠️' : ''}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <AppWrapper>
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

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.md }}>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 600); }} />}
        ListEmptyComponent={<EmptyState icon="📋" title="Aucune prospection trouvée" sub="Modifiez vos filtres ou ajoutez une prospection" />}
      />

        {/* FAB */}
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/(app)/prospections/new' as any)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </AppWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  searchBar: { backgroundColor: colors.white, padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  searchInput: { backgroundColor: colors.gray50, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: colors.gray800 },
  filterRow: { backgroundColor: colors.white, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100, flexGrow: 0 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: colors.gray200, backgroundColor: colors.white },
  chipActive: { backgroundColor: colors.violet, borderColor: colors.violet },
  chipText: { fontSize: 12, color: colors.gray600 },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  alertBanner: { backgroundColor: colors.dangerBg, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: '#f5c0c0' },
  alertText: { fontSize: 13, color: colors.danger, fontWeight: '600' },
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.xl, marginBottom: spacing.lg, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  cardUrgent: { borderLeftWidth: 3, borderLeftColor: colors.danger, backgroundColor: '#fff9f9' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.md },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.violetPale, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '700', color: colors.violet },
  nom: { fontSize: 14, fontWeight: '600', color: colors.gray800, marginBottom: 3 },
  produit: { fontSize: 13, color: colors.gray600, marginBottom: spacing.md },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
  footerText: { fontSize: 11, color: colors.gray600 },
  footerBold: { fontWeight: '700', color: colors.violetDark },
  urgentText: { fontSize: 11, color: colors.danger, fontWeight: '600' },
  relanceText: { fontSize: 11, color: colors.gray400, marginTop: spacing.sm },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: colors.orange, shadowOpacity: 0.4, shadowRadius: 10 },
  fabText: { fontSize: 28, color: colors.white, fontWeight: '300', lineHeight: 32 },
});
