import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '../../config/theme';

interface PageWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actionButton?: {
    label: string;
    onPress: () => void;
    icon?: string;
  };
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function PageWrapper({
  title,
  subtitle,
  children,
  actionButton,
  onRefresh,
  refreshing = false,
}: PageWrapperProps) {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {actionButton && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={actionButton.onPress}
            activeOpacity={0.8}
          >
            {actionButton.icon && (
              <Text style={styles.actionBtnIcon}>{actionButton.icon}</Text>
            )}
            <Text style={styles.actionBtnText}>{actionButton.label}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.violetDark,
  },
  subtitle: {
    fontSize: 13,
    color: colors.gray400,
    marginTop: 4,
  },
  actionBtn: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(232,82,26,0.3)',
  },
  actionBtnIcon: {
    fontSize: 14,
  },
  actionBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
});
