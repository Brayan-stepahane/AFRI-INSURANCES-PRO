import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useDashboardStats, useObjective } from '../../src/hooks/useDashboardStats';
import { useProspections } from '../../src/hooks/useProspections';
import { useCotations } from '../../src/hooks/useCotations';
import { useVentes } from '../../src/hooks/useVentes';
import { useClients } from '../../src/hooks/useClients';
import { Button } from '../../src/components/common/Button';
import { MetricCard, ObjectiveBox, Pipeline, UrgentFollowUps } from '../../src/components/dashboard/MetricCard';
import { NewProspectionModal } from '../../src/components/modals/NewProspectionModal';
import { ChangePasswordModal } from '../../src/components/modals/ChangePasswordModal';
import apiClient from '../../src/services/api/client';
import { API_ENDPOINTS } from '../../src/services/api/endpoints';
import { colors, spacing } from '../../src/config/theme';
import { fmt } from '../../src/utils/constants';
import { exportAllDataToCSV } from '../../src/utils/export';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout, changePassword, error: authError, isLoading: authLoading } = useAuth();
  const [reloadKey, setReloadKey] = React.useState(0);
  const stats = useDashboardStats(reloadKey);
  const objective = useObjective(reloadKey);
  const [refreshing, setRefreshing] = React.useState(false);
  const [showNewProspectionModal, setShowNewProspectionModal] = React.useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = React.useState(false);

  // Check if user has default password on component mount
  React.useEffect(() => {
    if (user?.isDefaultPassword) {
      setShowPasswordChangeModal(true);
    }
  }, [user?.isDefaultPassword]);

  const handlePasswordChangeSuccess = () => {
    setShowPasswordChangeModal(false);
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    await changePassword(currentPassword, newPassword);
  };

  const handleNewProspectionSubmit = async (data: any, isEdit?: boolean, prospectionId?: number, options?: { refreshOnly?: boolean }) => {
    if (options?.refreshOnly) {
      setReloadKey(prev => prev + 1);
      return;
    }

    try {
      const response = await apiClient.post(API_ENDPOINTS.PROSPECTIONS.CREATE, data);
      console.log('Created prospection from dashboard:', response.data);
      setShowNewProspectionModal(false);
      setReloadKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to create prospection:', error);
      Alert.alert('Erreur', 'Impossible de créer la prospection. Vérifiez vos informations et réessayez.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setReloadKey(prev => prev + 1);
    setTimeout(() => setRefreshing(false), 600);
  };

  const { prospections } = useProspections();
  const { cotations } = useCotations();
  const { ventes } = useVentes();
  const { clients } = useClients();
  const role = user?.role ?? 'commercial';
  const isCommercial = role === 'commercial';

  const handleExport = () => {
    try {
      exportAllDataToCSV(prospections, cotations, ventes, clients);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Erreur', 'Impossible d\'exporter les données');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (stats.loading || objective.loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.violet} />
        <Text style={styles.loadingText}>Chargement du tableau de bord...</Text>
      </View>
    );
  }

  if (stats.error || objective.error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Erreur de chargement</Text>
        <Text style={styles.errorSubtext}>{stats.error || objective.error}</Text>
        <Button title="Réessayer" onPress={() => setReloadKey(prev => prev + 1)} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.topBar}>
        <View>
          <Text style={styles.pageTitle}>Tableau de bord</Text>
          <Text style={styles.pageSubtitle}>Vue d'ensemble</Text>
        </View>
        <View style={styles.topBarActions}>
          <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/notifications' as any)}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
            <Text style={styles.exportBtnText}>Exporter</Text>
          </TouchableOpacity>
          {/* <Button title="+ Nouvelle prospection" onPress={() => setShowNewProspectionModal(true)} style={styles.topButton} /> */}
        </View>
      </View>

      <View style={styles.content}>
        {isCommercial && <ObjectiveBox objective={objective} />}

        <View style={styles.metricsGrid}>
          <View style={styles.metricCol}>
            <MetricCard label="Prospects actives" value={stats.activeProspects} subtext="en cours" valueColor={colors.violet} />
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
      {showNewProspectionModal && (
        <NewProspectionModal
          visible={showNewProspectionModal}
          onClose={() => setShowNewProspectionModal(false)}
          onSubmit={handleNewProspectionSubmit}
        />
      )}
      <ChangePasswordModal
        visible={showPasswordChangeModal}
        onSuccess={handlePasswordChangeSuccess}
        onChangePassword={handleChangePassword}
        isLoading={authLoading}
        error={authError}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  centerContent: { justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  loadingText: { marginTop: spacing.md, fontSize: 16, color: colors.gray600 },
  errorText: { fontSize: 18, fontWeight: '600', color: colors.danger, textAlign: 'center' },
  errorSubtext: { fontSize: 14, color: colors.gray600, textAlign: 'center', marginTop: spacing.sm },
  topBar: { backgroundColor: colors.white, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.gray200 },
  pageTitle: { fontSize: 18, fontWeight: '700', color: colors.violetDark },
  pageSubtitle: { fontSize: 13, color: colors.gray400, marginTop: 2 },
  topBarActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  notificationBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  notificationIcon: { fontSize: 16 },
  exportBtn: { paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  exportBtnText: { fontSize: 12, fontWeight: '700', color: colors.white },
  topButton: { paddingHorizontal: spacing.md, paddingVertical: 4, minHeight: 32 },
  content: { padding: spacing.xl },
  metricsGrid: { flexDirection: 'row', marginBottom: spacing.xl, gap: spacing.sm },
  metricCol: { flex: 1 },
  twoColumnSection: { flexDirection: 'row', gap: spacing.lg },
  leftColumn: { flex: 1 },
  rightColumn: { flex: 1 },
});
