import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { clients } from '../../src/store/data';
import { colors, spacing, radius } from '../../src/config/theme';
import { Client } from '../../src/types';

export default function ClientsScreen() {
  const { user } = useAuth();
  const role = user?.role ?? 'commercial';
  const allowed = ['admin', 'chef'];

  if (!allowed.includes(role)) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Accès refusé</Text>
        <Text style={styles.text}>Vous n'avez pas l'autorisation d'accéder à la base clients.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Base clients</Text>
      <Text style={styles.text}>{clients.length} clients enregistrés</Text>
      <FlatList
        data={clients}
        keyExtractor={(item: Client) => item.id}
        renderItem={({ item }: { item: Client }) => (
          <View style={styles.clientCard}>
            <Text style={styles.clientName}>{item.nom}</Text>
            <Text style={styles.clientMeta}>ID: {item.id}</Text>
            <Text style={styles.clientMeta}>Tel: {item.tel || 'N/A'}</Text>
            <Text style={styles.clientMeta}>Activité: {item.activite}</Text>
            <Text style={styles.clientMeta}>Type: {item.type}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50, padding: spacing.xl },
  title: { fontSize: 22, fontWeight: '700', color: colors.violetDark, marginBottom: spacing.sm },
  text: { fontSize: 14, color: colors.gray600, marginBottom: spacing.md },
  list: { paddingBottom: spacing.xl },
  clientCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.gray100 },
  clientName: { fontSize: 15, fontWeight: '700', color: colors.violetDark, marginBottom: 4 },
  clientMeta: { fontSize: 12, color: colors.gray600 },
});