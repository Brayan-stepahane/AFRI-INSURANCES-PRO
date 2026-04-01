import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import {
  getProspectionsForUser, getCotationsForUser,
  getClient, isOverdue, fmt, fmtDate,
} from '../../src/store/data';
import { colors, spacing, radius } from '../../src/config/theme';
import { Header } from '../../src/components/common/Header';
import { EmptyState } from '../../src/components/common/Button';
import { AppWrapper } from '../../src/components/common/AppWrapper';

export default function NotificationsScreen() {
  const { user }  = useAuth();
  const router    = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const name = user?.name ?? '';
  const role = user?.role ?? 'commercial';

  const relances = getProspectionsForUser(name, role).filter(
    p => p.dateRelance && isOverdue(p.dateRelance) &&
         !['Contrat conclu', 'Perdu'].includes(p.statut)
  );

  const cotEnAttente = getCotationsForUser(name, role).filter(
    c => c.statut === 'En attente'
  );

  const total = relances.length + cotEnAttente.length;

  return (
    <AppWrapper>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 600); }} />}
      >
        <Header
        title="Notifications"
        subtitle={total > 0 ? `${total} alerte(s) active(s)` : 'Aucune alerte'}
      />

      <View style={styles.content}>
        {/* ── Relances urgentes ── */}
        {relances.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔔 Relances en retard</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{relances.length}</Text>
              </View>
            </View>

            {relances.map(p => {
              const cli = getClient(p.clientId);
              const joursRetard = Math.floor((Date.now() - new Date(p.dateRelance).getTime()) / 86400000);
              return (
                <TouchableOpacity
                  key={p.id}
                  style={styles.notifCardDanger}
                  onPress={() => router.push(`/(app)/prospections/${p.id}` as any)}
                  activeOpacity={0.8}
                >
                  <View style={styles.notifIcon}>
                    <Text style={{ fontSize: 20 }}>🔔</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifTitle}>{cli?.nom || p.clientId}</Text>
                    <Text style={styles.notifSub}>{p.produit}</Text>
                    <Text style={styles.notifDate}>
                      Prévu le {fmtDate(p.dateRelance)} · {joursRetard > 0 ? `${joursRetard} jour(s) de retard` : 'Aujourd\'hui'}
                    </Text>
                  </View>
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentBadgeText}>En retard</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* ── Cotations en attente ── */}
        {cotEnAttente.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: relances.length > 0 ? spacing.xl : 0 }]}>
              <Text style={styles.sectionTitle}>💼 Cotations en attente</Text>
              <View style={[styles.countBadge, { backgroundColor: colors.warningBg }]}>
                <Text style={[styles.countText, { color: colors.warning }]}>{cotEnAttente.length}</Text>
              </View>
            </View>

            {cotEnAttente.map(c => {
              const cli = getClient(c.clientId);
              return (
                <TouchableOpacity
                  key={c.id}
                  style={styles.notifCardWarning}
                  onPress={() => router.push(`/(app)/cotations/${c.id}` as any)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.notifIcon, { backgroundColor: colors.warningBg }]}>
                    <Text style={{ fontSize: 20 }}>💼</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.notifTitle, { color: colors.warning }]}>
                      COT-{String(c.noCot).padStart(3, '0')} — {cli?.nom || c.clientId}
                    </Text>
                    <Text style={styles.notifSub}>{c.risqueCote} · {fmt(c.montant)} FCFA</Text>
                    <Text style={styles.notifDate}>
                      Envoyée le {fmtDate(c.dateCotation)} — En attente de réponse
                    </Text>
                  </View>
                  <View style={[styles.urgentBadge, { backgroundColor: colors.warningBg }]}>
                    <Text style={[styles.urgentBadgeText, { color: colors.warning }]}>À relancer</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* ── Vide ── */}
        {total === 0 && (
          <View style={{ marginTop: 40 }}>
            <EmptyState
              icon="✅"
              title="Tout est à jour !"
              sub="Aucune relance en retard, aucune cotation en attente"
            />
          </View>
        )}

        {/* ── Tips ── */}
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 Rappels automatiques</Text>
          <Text style={styles.tipText}>
            Les alertes apparaissent ici automatiquement lorsqu'une date de relance est dépassée ou qu'une cotation attend une réponse depuis plus de 7 jours.
          </Text>
        </View>
      </View>
      </ScrollView>
    </AppWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  content:   { padding: spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.gray800, flex: 1 },
  countBadge: { backgroundColor: colors.dangerBg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  countText:  { fontSize: 12, fontWeight: '700', color: colors.danger },
  notifCardDanger: {
    backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: spacing.xl,
    marginBottom: spacing.lg, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg,
    borderWidth: 1, borderColor: '#f5c0c0',
  },
  notifCardWarning: {
    backgroundColor: colors.warningBg, borderRadius: radius.md, padding: spacing.xl,
    marginBottom: spacing.lg, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg,
    borderWidth: 1, borderColor: '#e8c97a',
  },
  notifIcon: { width: 42, height: 42, borderRadius: radius.sm, backgroundColor: colors.dangerBg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: colors.danger, marginBottom: 2 },
  notifSub:   { fontSize: 12, color: colors.gray600, marginBottom: 3 },
  notifDate:  { fontSize: 11, color: colors.gray400 },
  urgentBadge: { backgroundColor: colors.dangerBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#f5c0c0' },
  urgentBadgeText: { fontSize: 10, fontWeight: '700', color: colors.danger },
  tipBox: { backgroundColor: colors.infoBg, borderRadius: radius.md, padding: spacing.xl, marginTop: spacing.xl, borderLeftWidth: 3, borderLeftColor: colors.info },
  tipTitle: { fontSize: 14, fontWeight: '700', color: colors.info, marginBottom: spacing.md },
  tipText:  { fontSize: 13, color: colors.info, lineHeight: 19 },
});
