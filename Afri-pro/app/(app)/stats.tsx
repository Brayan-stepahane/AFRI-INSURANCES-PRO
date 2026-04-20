import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { useCotations } from '../../src/hooks/useCotations';
import { useVentes } from '../../src/hooks/useVentes';
import { colors, spacing, radius } from '../../src/config/theme';

type AggregatedData = { name: string; value: number }[];

type ValueMap = Record<string, number>;

const ADMIN_ROLES = ['manager', 'chef_agence', 'admin', 'manager_adjoint'];

const sortByValueDesc = (items: AggregatedData) => [...items].sort((a, b) => b.value - a.value);

export default function StatsScreen() {
  const { user } = useAuth();
  const role = user?.role ?? 'commercial';
  const { cotations } = useCotations();
  const { ventes } = useVentes();

  if (!ADMIN_ROLES.includes(role)) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Accès refusé</Text>
        <Text style={styles.message}>Votre rôle ne permet pas de consulter les statistiques globales.</Text>
      </View>
    );
  }

  const totalCA = ventes.reduce((sum, v) => sum + (v.primeNette || 0) + (v.accessoires || 0), 0);
  const totalVentes = ventes.length;
  const avgPrime = totalVentes > 0 ? Math.round(totalCA / totalVentes) : 0;
  const totalCot = cotations.length;
  const convCot = cotations.filter(c => c.statut === 'Convertie en vente').length;
  const tauxConv = totalCot > 0 ? Math.round((convCot / totalCot) * 100) : 0;

  const productMap = ventes.reduce((acc: ValueMap, v) => {
    const product = v.produit || 'Inconnu';
    acc[product] = (acc[product] || 0) + (v.primeNette || 0) + (v.accessoires || 0);
    return acc;
  }, {} as ValueMap);

  const topProduit = Object.entries(productMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)[0]?.name || 'Aucun';

  const productLines = sortByValueDesc(Object.entries(productMap).map(([name, value]) => ({ name, value })));

  const monthMap = ventes.reduce((acc: ValueMap, v) => {
    if (!v.dateVente) return acc;
    const d = new Date(v.dateVente);
    if (Number.isNaN(d.getTime())) return acc;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    acc[key] = (acc[key] || 0) + (v.primeNette || 0) + (v.accessoires || 0);
    return acc;
  }, {} as ValueMap);

  const monthLines = sortByValueDesc(Object.entries(monthMap).map(([name, value]) => ({ name, value }))).slice(0, 6).reverse();

  const maxProductValue = Math.max(...productLines.map(x => x.value), 1);
  const maxMonthValue = Math.max(...monthLines.map(x => x.value), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Statistiques</Text>
          <Text style={styles.subtitle}>Rapports</Text>
        </View>
        <View style={styles.actionPlaceholder} />
      </View>

      <View style={styles.metricGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>CA TOTAL</Text>
          <Text style={styles.metricValue}>{(totalCA/1000).toLocaleString('fr-FR')}K FCFA</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>MOY. PRIME/VENTE</Text>
          <Text style={styles.metricValue}>{avgPrime.toLocaleString('fr-FR')} FCFA</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>TAUX CONV. COTATION</Text>
          <Text style={styles.metricValue}>{tauxConv}%</Text>
          <Text style={styles.metricSub}>{convCot}/{totalCot} converties</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>TOP PRODUIT</Text>
          <Text style={styles.metricValue}>{topProduit}</Text>
        </View>
      </View>

      <View style={styles.chartsRow}>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>CA par produit (FCFA)</Text>
          {productLines.map((item, idx) => {
            const width = Math.max(20, Math.round((item.value / maxProductValue) * 100));
            return (
              <View key={`product-${idx}`} style={styles.barLine}>
                <Text style={styles.barLabel}>{item.name}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${width}%` }]} />
                </View>
                <Text style={styles.barValue}>{item.value.toLocaleString('fr-FR')}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>CA mensuel (FCFA)</Text>
          {monthLines.map((item, idx) => {
            const width = Math.max(20, Math.round((item.value / maxMonthValue) * 100));
            return (
              <View key={`month-${idx}`} style={styles.barLine}>
                <Text style={styles.barLabel}>{item.name}</Text>
                <View style={styles.barTrack}> 
                  <View style={[styles.barFillAlt, { width: `${width}%` }]} />
                </View>
                <Text style={styles.barValue}>{item.value.toLocaleString('fr-FR')}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50, padding: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: 24, fontWeight: '800', color: colors.violetDark },
  subtitle: { fontSize: 13, color: colors.gray600, marginTop: 4 },
  actionPlaceholder: { width: 120, height: 36 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  metricBox: { backgroundColor: '#fff', borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray100, padding: spacing.lg, width: '48%' },
  metricLabel: { color: colors.gray600, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  metricValue: { color: colors.violetDark, fontSize: 22, fontWeight: '800' },
  metricSub: { color: colors.gray600, fontSize: 12, marginTop: 3 },
  chartsRow: { flexDirection: 'row', gap: spacing.lg },
  chartCard: { flex: 1, backgroundColor: '#fff', borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray100, padding: spacing.lg, maxHeight: 520 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: colors.violetDark, marginBottom: spacing.md },
  barLine: { marginBottom: spacing.sm },
  barLabel: { fontSize: 12, color: colors.gray600, marginBottom: 4 },
  barTrack: { height: 12, borderRadius: 100, backgroundColor: '#eee', overflow: 'hidden', marginBottom: 2 },
  barFill: { height: '100%', backgroundColor: colors.orange },
  barFillAlt: { height: '100%', backgroundColor: colors.violet },
  barValue: { fontSize: 12, color: colors.gray600 },
  message: { color: colors.gray600, marginTop: spacing.sm },
});