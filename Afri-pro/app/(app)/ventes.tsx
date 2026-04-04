import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput,
  TouchableOpacity, RefreshControl, ScrollView,
} from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { getVentesForUser, getClient, fmt, fmtDate } from '../../src/store/data';
import { colors, spacing, radius } from '../../src/config/theme';
import { Badge, EmptyState, ClientIdBadge, StatCard } from '../../src/components/common/Button';
import { Header } from '../../src/components/common/Header';
import { Vente } from '../../src/types';

export default function VentesScreen() {
  const { user }  = useAuth();
  const [search, setSearch]   = useState('');
  const [filterMois, setFilterMois] = useState('Tous');
  const [refreshing, setRefreshing] = useState(false);

  const name = user?.name ?? '';
  const role = user?.role ?? 'commercial';
  const allVentes = getVentesForUser(name, role);

  // Months available
  const mois = ['Tous', ...Array.from(new Set(
    allVentes.map(v => v.dateVente?.slice(0, 7)).filter(Boolean)
  )).sort().reverse()];

  let list = allVentes;
  if (filterMois !== 'Tous') list = list.filter(v => v.dateVente?.startsWith(filterMois));
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(v => {
      const cli = getClient(v.clientId);
      return (cli?.nom || '').toLowerCase().includes(q) || v.produit.toLowerCase().includes(q);
    });
  }

  const totalPrimes = list.reduce((s, v) => s + (v.primeNette || 0), 0);
  const totalAcc    = list.reduce((s, v) => s + (v.accessoires || 0), 0);
  const totalCA     = totalPrimes + totalAcc;

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
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
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
});
