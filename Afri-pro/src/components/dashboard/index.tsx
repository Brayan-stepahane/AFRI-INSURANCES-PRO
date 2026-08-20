import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radius, typography } from '../../config/theme';
import { ProgressBar } from '../common/Button';
import { fmt, fmtDate } from '../../utils/constants';
import { useClients } from '../../hooks/useClients';
import { Prospection } from '../../types';

// ─── METRIC CARD ─────────────────────────────────────────────────────────────
interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  valueColor?: string;
}

export function MetricCard({ label, value, subtext, valueColor = colors.violetDark }: MetricCardProps) {
  return (
    <View style={mcStyles.card}>
      <Text style={mcStyles.label}>{label}</Text>
      <Text style={[mcStyles.value, { color: valueColor }]}>{value}</Text>
      {subtext ? <Text style={mcStyles.sub}>{subtext}</Text> : null}
    </View>
  );
}

const mcStyles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.xl, borderWidth: 1, borderColor: colors.gray200 },
  label: { fontSize: 10, color: colors.gray400, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  value: { fontSize: 22, fontWeight: '700', marginVertical: 4 },
  sub: { fontSize: 11, color: colors.gray600 },
});

// ─── OBJECTIVE BOX ────────────────────────────────────────────────────────────
interface ObjProps {
  objective: {
    ca: number;
    total: number;
    mensuel: number;
    reporte: number;
    pct: number;
    reste: number;
    caVie?: number;
    caNonVie?: number;
    mensuelVie?: number;
    mensuelNonVie?: number;
    reporteVie?: number;
    reporteNonVie?: number;
    loading?: boolean;
    error?: string | null;
  };
  label?: string;
}

export function ObjectiveBox({ objective, label }: ObjProps) {
  const {
    ca,
    total,
    mensuel,
    reporte,
    pct,
    reste,
    caVie = 0,
    caNonVie = 0,
    mensuelVie = mensuel / 2,
    mensuelNonVie = mensuel / 2,
    reporteVie = 0,
    reporteNonVie = 0,
  } = objective;

  const now = new Date();
  const monthName = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthEnd = `${lastDayOfMonth} ${now.toLocaleDateString('fr-FR', { month: 'long' }).toLowerCase()}`;

  const totalVie = mensuelVie + reporteVie;
  const totalNonVie = mensuelNonVie + reporteNonVie;
  const pctVie = totalVie > 0 ? Math.min(100, Math.round((caVie / totalVie) * 100)) : 0;
  const pctNonVie = totalNonVie > 0 ? Math.min(100, Math.round((caNonVie / totalNonVie) * 100)) : 0;

  return (
    <View>
      <View style={objStyles.container}>
        {/* Top row: Label and Progress percentage */}
        <View style={objStyles.topRow}>
          <Text style={objStyles.label}>{label || `OBJECTIF ${monthName}`}</Text>
          <View style={objStyles.progressPct}>
            <Text style={objStyles.progressPctText}>Avancement</Text>
            <Text style={objStyles.pctValue}>{pct}%</Text>
          </View>
        </View>

        {/* Monetary objective display row */}
        <View style={objStyles.contractRow}>
          <View style={objStyles.contractDisplay}>
            <Text style={objStyles.contractIcon}>{fmt(ca)} FCFA</Text>
            <Text style={objStyles.contractCount}>/ {fmt(total)} FCFA</Text>
          </View>
          <Text style={objStyles.subtext}>Chiffre d'affaires réalisé</Text>
        </View>

        {/* Progress bar */}
        <View style={objStyles.progressBarContainer}>
          <ProgressBar value={pct} color={pct >= 100 ? colors.success : colors.orange} />
        </View>

        {/* Details text box - monetary objective content */}
        <View style={objStyles.detailsBox}>
          <Text style={objStyles.detailsText}>
            💼  <Text style={objStyles.textRed}>{fmt(reporte)} FCFA</Text> reportés du mois précédent + <Text style={objStyles.textRed}>{fmt(mensuel)} FCFA</Text> ce mois = <Text style={objStyles.textRed}>{fmt(total)} FCFA</Text>.
          </Text>
          <Text style={objStyles.detailsText}>
            Il vous reste <Text style={objStyles.textRed}>{fmt(reste)} FCFA</Text> à réaliser d'ici le <Text style={objStyles.textRed}>{monthEnd}</Text>.
          </Text>
        </View>
      </View>

      {/* Vie and Non-Vie Breakdown */}
      <View style={objStyles.twoColContainer}>
        {/* Vie */}
        <View style={objStyles.vieContainer}>
          <View style={objStyles.vieTopRow}>
            <Text style={objStyles.vieLabel}>ASSURANCE VIE</Text>
            <Text style={objStyles.viePct}>{pctVie}%</Text>
          </View>
          <View style={objStyles.vieValue}>
            <Text style={objStyles.vieAmount}>{fmt(caVie)} FCFA</Text>
            <Text style={objStyles.vieTarget}>/ {fmt(totalVie)} FCFA</Text>
          </View>
          <View style={objStyles.vieProgressBar}>
            <View style={[objStyles.vieProgressFill, { width: `${pctVie}%`, backgroundColor: colors.success }]} />
          </View>
        </View>

        {/* Non-Vie */}
        <View style={objStyles.nonVieContainer}>
          <View style={objStyles.nonVieTopRow}>
            <Text style={objStyles.nonVieLabel}>ASSURANCE NON-VIE</Text>
            <Text style={objStyles.nonViePct}>{pctNonVie}%</Text>
          </View>
          <View style={objStyles.nonVieValue}>
            <Text style={objStyles.nonVieAmount}>{fmt(caNonVie)} FCFA</Text>
            <Text style={objStyles.nonVieTarget}>/ {fmt(totalNonVie)} FCFA</Text>
          </View>
          <View style={objStyles.nonVieProgressBar}>
            <View style={[objStyles.nonVieProgressFill, { width: `${pctNonVie}%`, backgroundColor: colors.violet }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const objStyles = StyleSheet.create({
  container: { backgroundColor: colors.violetDark, borderRadius: radius.lg, padding: spacing.xxxl, marginBottom: spacing.lg },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl },
  label: { fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: '600' },
  progressPct: { alignItems: 'flex-end' },
  progressPctText: { fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: 0.5 },
  pctValue: { fontSize: 20, fontWeight: '800', color: colors.white, marginTop: 2 },
  contractRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.lg },
  contractDisplay: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  contractIcon: { fontSize: 20, color: colors.orange, fontWeight: '800' },
  contractCount: { fontSize: 20, fontWeight: '800', color: colors.white },
  subtext: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  progressBarContainer: { height: 8, marginBottom: spacing.lg, borderRadius: 4, overflow: 'hidden' },
  detailsBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radius.sm, padding: spacing.lg },
  detailsText: { fontSize: 12, lineHeight: 18, color: 'rgba(255,255,255,0.85)' },
  textRed: { color: colors.orange, fontWeight: '700' },
  textNormal: { color: 'rgba(255,255,255,0.85)' },
  twoColContainer: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.xl },
  vieContainer: { flex: 1, backgroundColor: colors.violetDark, borderRadius: radius.lg, padding: spacing.xl },
  vieTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  vieLabel: { fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: '600' },
  viePct: { fontSize: 14, fontWeight: '800', color: colors.orange },
  vieValue: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginBottom: spacing.md },
  vieAmount: { fontSize: 18, color: colors.orange, fontWeight: '800' },
  vieTarget: { fontSize: 14, fontWeight: '800', color: colors.white },
  vieProgressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' },
  vieProgressFill: { height: '100%', borderRadius: 3 },
  nonVieContainer: { flex: 1, backgroundColor: colors.violetDark, borderRadius: radius.lg, padding: spacing.xl },
  nonVieTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  nonVieLabel: { fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: '600' },
  nonViePct: { fontSize: 14, fontWeight: '800', color: colors.orange },
  nonVieValue: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginBottom: spacing.md },
  nonVieAmount: { fontSize: 18, color: colors.orange, fontWeight: '800' },
  nonVieTarget: { fontSize: 14, fontWeight: '800', color: colors.white },
  nonVieProgressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' },
  nonVieProgressFill: { height: '100%', borderRadius: 3 },
});

// ─── PIPELINE ─────────────────────────────────────────────────────────────────
interface PipelineStep { label: string; count: number; status: 'done' | 'active' | 'pending' }

export function Pipeline({ steps }: { steps: PipelineStep[] }) {
  return (
    <View style={pStyles.card}>
      <Text style={pStyles.title}>Pipeline commercial</Text>
      <View style={pStyles.row}>
        {steps.map((s, i) => (
          <View key={`${s.label}-${i}`} style={[pStyles.step, s.status === 'active' && pStyles.stepActive, s.status === 'done' && pStyles.stepDone]}>
            <Text style={[pStyles.count, s.status === 'active' && { color: colors.orange }, s.status === 'done' && { color: colors.violet }]}>{s.count}</Text>
            <Text style={[pStyles.label, s.status === 'active' && { color: colors.white }, s.status === 'done' && { color: colors.violet }]}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const pStyles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.xl, borderWidth: 1, borderColor: colors.gray200 },
  title: { fontSize: 14, fontWeight: '700', color: colors.violetDark, marginBottom: spacing.lg },
  row: { flexDirection: 'row', gap: 0 },
  step: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200 },
  stepActive: { backgroundColor: colors.violet, borderColor: colors.violet },
  stepDone: { backgroundColor: colors.violetPale, borderColor: colors.violetLight },
  count: { fontSize: 20, fontWeight: '800', color: colors.gray400 },
  label: { fontSize: 10, color: colors.gray400, marginTop: 2 },
});

// ─── URGENT FOLLOW-UPS ────────────────────────────────────────────────────────
export function UrgentFollowUps({ prospects }: { prospects: Prospection[] }) {
  const { clients } = useClients();
  const getClient = (id: string) => clients.find(c => c.id === id);

  return (
    <View style={ufStyles.card}>
      <View style={ufStyles.header}>
        <Text style={ufStyles.title}>Relances urgentes</Text>
        {prospects.length > 0 && (
          <View style={ufStyles.badge}>
            <Text style={ufStyles.badgeText}>{prospects.length} en retard</Text>
          </View>
        )}
      </View>
      {prospects.length === 0 ? (
        <Text style={ufStyles.empty}>✅ Aucune relance en retard</Text>
      ) : (
        prospects.slice(0, 4).map(p => {
          const cli = getClient(p.clientId);
          return (
            <View key={p.id} style={ufStyles.item}>
              <View style={ufStyles.avatar}>
                <Text style={ufStyles.avatarText}>{(cli?.nom || '?')[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ufStyles.nom}>{cli?.nom || p.clientId}</Text>
                <Text style={ufStyles.produit}>{p.produit}</Text>
              </View>
              <Text style={ufStyles.date}>{fmtDate(p.dateRelance)}</Text>
            </View>
          );
        })
      )}
    </View>
  );
}

const ufStyles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.xl, borderWidth: 1, borderColor: colors.gray200 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  title: { fontSize: 14, fontWeight: '700', color: colors.violetDark },
  badge: { backgroundColor: colors.dangerBg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, color: colors.danger, fontWeight: '600' },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.dangerBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '700', color: colors.danger },
  nom: { fontSize: 13, fontWeight: '600', color: colors.danger },
  produit: { fontSize: 11, color: colors.gray400, marginTop: 1 },
  date: { fontSize: 11, color: colors.danger, fontWeight: '600' },
  empty: { fontSize: 13, color: colors.gray400, textAlign: 'center', paddingVertical: spacing.xl },
});
