import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
} from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useTeamObjectives } from '../../src/hooks/useDashboardStats';
import { colors, spacing, radius } from '../../src/config/theme';
import { ProgressBar } from '../../src/components/common/Button';
import { Header } from '../../src/components/common/Header';
import { fmt } from '../../src/utils/constants';

export default function ObjectifsScreen() {
  const { user } = useAuth();
  const responsive = useResponsive();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const role = user?.role ?? 'commercial';
  const teamObj = useTeamObjectives(refreshKey);

  const onRefresh = () => {
    setRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Header title="Objectifs" subtitle={new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} />

      <View style={[styles.content, { paddingHorizontal: responsive.padding }]}>
        {/* ── Team objectives ── */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            📌  Les objectifs non atteints en fin de mois sont <Text style={{ fontWeight: '700' }}>automatiquement reportés</Text> sur le mois suivant et s'ajoutent au nouvel objectif.
          </Text>
        </View>

          {teamObj.map(o => (
                <View key={o.commercial + o.mensuel} style={styles.teamCard}>
                <View style={styles.teamHeader}>
                  <View style={styles.teamAvatar}>
                    <Text style={styles.teamAvatarText}>{o.commercial.slice(0, 2)}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.lg }}>
                    <Text style={styles.teamNom}>{o.commercial}</Text>
                    <Text style={styles.teamSub}>{fmt(o.ca)} / {fmt(o.total)} FCFA</Text>
                  </View>
                  <Text style={[styles.teamPct, {
                    color: o.pct >= 100 ? colors.success : o.pct >= 70 ? colors.warning : colors.danger,
                  }]}>{o.pct}%</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md }}>
                  <ProgressBar value={o.pct} />
                </View>

                {/* Vie and Non-Vie breakdown */}
                <View style={{ flexDirection: 'row', marginTop: spacing.md, gap: spacing.md }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniTitle}>Vie</Text>
                    <Text style={styles.miniValue}>{fmt(o.caVie)} / {fmt(o.mensuelVie + o.reporteVie)} FCFA</Text>
                    <View style={{ height: 6, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
                      <View style={{
                        width: `${o.mensuelVie + o.reporteVie > 0 ? Math.min(100, (o.caVie / (o.mensuelVie + o.reporteVie)) * 100) : 0}%`,
                        height: '100%',
                        backgroundColor: colors.success,
                        borderRadius: 3
                      }} />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniTitle}>Non-Vie</Text>
                    <Text style={styles.miniValue}>{fmt(o.caNonVie)} / {fmt(o.mensuelNonVie + o.reporteNonVie)} FCFA</Text>
                    <View style={{ height: 6, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
                      <View style={{
                        width: `${o.mensuelNonVie + o.reporteNonVie > 0 ? Math.min(100, (o.caNonVie / (o.mensuelNonVie + o.reporteNonVie)) * 100) : 0}%`,
                        height: '100%',
                        backgroundColor: colors.violet,
                        borderRadius: 3
                      }} />
                    </View>
                  </View>
                </View>

                <View style={styles.teamDetails}>
                  <Text style={styles.teamDetailText}>Objectif : {fmt(o.mensuel)} FCFA</Text>
                  {o.reporte > 0 && (
                    <Text style={[styles.teamDetailText, { color: colors.orange }]}>
                      + {fmt(o.reporte)} FCFA reportés
                    </Text>
                  )}
                  <Text style={[styles.teamDetailText, o.reste > 0 ? { color: colors.danger } : { color: colors.success }]}>
                    {o.reste > 0 ? `Reste : ${fmt(o.reste)} FCFA` : '✅ Atteint !'}
                  </Text>
                </View>
              </View>
            ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  content:   { padding: spacing.xl },
  objBox: { backgroundColor: colors.violetDark, borderRadius: radius.lg, padding: spacing.xxxl, marginBottom: spacing.xl },
  objLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.md },
  objValue: { fontSize: 28, fontWeight: '800', color: colors.white },
  objSub:   { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4, marginBottom: spacing.xl },
  progressWrap: { marginBottom: spacing.lg },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  progressLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  progressPct:   { fontSize: 12, color: colors.orange, fontWeight: '700' },
  reportBox: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.sm, padding: spacing.lg },
  reportText: { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
  twoCol:   { flexDirection: 'row', marginBottom: spacing.xl },
  card:     { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.xl, borderWidth: 1, borderColor: colors.gray200 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.violetDark, marginBottom: spacing.lg },
  emptyText: { fontSize: 12, color: colors.gray400, textAlign: 'center', paddingVertical: spacing.lg },
  listRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  listNom:  { fontSize: 12, fontWeight: '600', color: colors.gray800 },
  listSub:  { fontSize: 10, color: colors.gray400, marginTop: 2 },
  listValue:{ fontSize: 11, fontWeight: '700', color: colors.violetDark },
  miniStatut: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 10 },
  infoBox:  { backgroundColor: colors.infoBg, borderRadius: radius.sm, padding: spacing.lg, marginBottom: spacing.xl, borderLeftWidth: 3, borderLeftColor: colors.info },
  infoText: { fontSize: 13, color: colors.info, lineHeight: 19 },
  teamCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.xl, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.gray200, elevation: 2 },
  teamHeader: { flexDirection: 'row', alignItems: 'center' },
  teamAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.violetPale, alignItems: 'center', justifyContent: 'center' },
  teamAvatarText: { fontSize: 13, fontWeight: '700', color: colors.violet },
  teamNom: { fontSize: 14, fontWeight: '600', color: colors.gray800 },
  teamSub: { fontSize: 11, color: colors.gray400, marginTop: 2 },
  teamPct: { fontSize: 18, fontWeight: '800' },
  teamDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.gray100 },
  teamDetailText: { fontSize: 12, color: colors.gray600 },
  miniTitle: { fontSize: 11, color: colors.gray600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  miniValue: { fontSize: 12, color: colors.gray800, fontWeight: '600' },
  errorBox: { backgroundColor: colors.dangerBg, borderRadius: radius.sm, padding: spacing.lg, marginBottom: spacing.xl, borderLeftWidth: 3, borderLeftColor: colors.danger },
  errorText: { fontSize: 13, color: colors.danger, lineHeight: 19 },
});
