import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useDashboardStats, useObjective } from '../../src/hooks/useDashboardStats';
import { Button } from '../../src/components/common/Button';
import { MetricCard, ObjectiveBox, Pipeline, UrgentFollowUps } from '../../src/components/dashboard/MetricCard';
import { NewProspectionModal } from '../../src/components/modals/NewProspectionModal';
import { colors, spacing, radius } from '../../src/config/theme';
import { fmt, fmtDate, getClient, ventes as allVentes } from '../../src/store/data';

export default function DashboardScreen() {
  const router   = useRouter();
  const { user, logout } = useAuth();
  const stats    = useDashboardStats();
  const objective = useObjective();
  const [refreshing, setRefreshing] = React.useState(false);
  const [showNewProspectionModal, setShowNewProspectionModal] = React.useState(false);

  const handleNewProspectionSubmit = (data: any) => {
    console.log('New prospection from dashboard:', data);
    setShowNewProspectionModal(false);
  };

  const onRefresh = async () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 600); };

  const role = user?.role ?? 'commercial';
  const isCommercial = role === 'commercial';

  const recentSales = allVentes
    .filter(v => !isCommercial || v.commercial === user?.name)
    .slice(-4).reverse();

  const handleLogout = async () => { await logout(); router.replace('/(auth)/login'); };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* ── Top bar with title and buttons ── */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.pageTitle}>Tableau de bord</Text>
          <Text style={styles.pageSubtitle}>Vue d'ensemble</Text>
        </View>
        <View style={styles.topBarActions}>
          <TouchableOpacity style={styles.notificationBtn}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
          <Button title="+ Nouvelle prospection" onPress={() => setShowNewProspectionModal(true)} style={styles.topButton} />
        </View>
      </View>

      <View style={styles.content}>
        {/* ── Objective box (commercial) ── */}
        {isCommercial && <ObjectiveBox objective={objective} />}

        {/* ── Stats grid - 4 cards to match design ── */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCol}>
            <MetricCard label="Prospects actifs" value={stats.activeProspects} subtext="en cours" valueColor={colors.violet} />
          </View>
          <View style={styles.metricCol}>
            <MetricCard
              label="Cotations"
              value={stats.quotations}
              subtext={`${stats.pendingCotations} en attente`}
              valueColor={colors.teal}
            />
          </View>
          <View style={styles.metricCol}>
            <MetricCard label="Ventes" value={stats.completedSales} subtext="contrats" valueColor={colors.orange} />
          </View>
          <View style={styles.metricCol}>
            <MetricCard label="CA total" value={`${fmt(Math.round(stats.totalRevenue / 1000))}K`} subtext="FCFA" valueColor={colors.violetDark} />
          </View>
        </View>

        {/* ── Pipeline & Urgent follow-ups side by side ── */}
        <View style={styles.twoColumnSection}>
          <View style={styles.leftColumn}>
            <Pipeline
              steps={[
                { label: 'Prospection', count: stats.pipelineData.prospects, status: 'done' },
                { label: 'Cotation',    count: stats.pipelineData.quotations, status: 'done' },
                { label: 'Vente',       count: stats.pipelineData.sales,      status: 'active' },
              ]}
            />
          </View>
          <View style={styles.rightColumn}>
            <UrgentFollowUps prospects={stats.urgentFollowUps} />
          </View>
        </View>
      </View>
      <NewProspectionModal
        visible={showNewProspectionModal}
        onClose={() => setShowNewProspectionModal(false)}
        onSubmit={handleNewProspectionSubmit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  topBar: { backgroundColor: colors.white, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.gray200 },
  pageTitle: { fontSize: 18, fontWeight: '700', color: colors.violetDark },
  pageSubtitle: { fontSize: 13, color: colors.gray400, marginTop: 2 },
  topBarActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  notificationBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  notificationIcon: { fontSize: 16 },
  topButton: { paddingHorizontal: spacing.md, paddingVertical: 4, minHeight: 32 },
  content: { padding: spacing.xl },
  metricsGrid: { flexDirection: 'row', marginBottom: spacing.xl, gap: spacing.sm },
  metricCol: { flex: 1 },
  twoColumnSection: { flexDirection: 'row', gap: spacing.lg },
  leftColumn: { flex: 1 },
  rightColumn: { flex: 1 },
});
