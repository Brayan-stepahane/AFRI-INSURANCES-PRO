import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, spacing, radius, typography } from '../../config/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
}) => {
  const variants: Record<
    'primary' | 'secondary' | 'danger' | 'outline',
    {
      backgroundColor: string;
      textColor: string;
      borderWidth?: number;
      borderColor?: string;
    }
  > = {
    primary: {
      backgroundColor: colors.orange,
      textColor: colors.white,
    },
    secondary: {
      backgroundColor: colors.violetLight,
      textColor: colors.white,
    },
    danger: {
      backgroundColor: colors.danger,
      textColor: colors.white,
    },
    outline: {
      backgroundColor: colors.white,
      textColor: colors.violet,
      borderWidth: 1.5,
      borderColor: colors.violet,
    },
  };

  const variant_style = variants[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: variant_style.backgroundColor,
          borderWidth: variant_style.borderWidth || 0,
          borderColor: variant_style.borderColor,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: variant_style.textColor }]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  text: {
    ...typography.bodyBold,
    fontSize: 15,
  },
});

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
interface ProgressProps {
  value: number; // 0-100
  color?: string;
  height?: number;
}

export function ProgressBar({ value, color, height = 8 }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, value));
  const barColor = color ?? (pct >= 100 ? colors.success : pct >= 70 ? colors.warning : colors.danger);
  return (
    <View style={[progressStyles.bg, { height }]}>
      <View style={[progressStyles.fill, { width: `${pct}%`, backgroundColor: barColor, height }]} />
    </View>
  );
}

const progressStyles = StyleSheet.create({
  bg: { backgroundColor: colors.gray100, borderRadius: 99, overflow: 'hidden', flex: 1 },
  fill: { borderRadius: 99 },
});

// ─── BADGE ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  label: string;
  bg: string;
  text: string;
  small?: boolean;
}

export function Badge({ label, bg, text, small }: BadgeProps) {
  return (
    <View style={[badgeStyles.container, { backgroundColor: bg }]}>
      <Text style={[badgeStyles.text, { color: text }, small && badgeStyles.small]}>{label}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  container: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '600' },
  small: { fontSize: 10 },
});

// ─── STAT CARD ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  valueColor?: string;
}

export function StatCard({ label, value, subtext, valueColor = colors.violetDark }: StatCardProps) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.value, { color: valueColor }]}>{value}</Text>
      {subtext ? <Text style={statStyles.sub}>{subtext}</Text> : null}
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.xl, borderWidth: 1, borderColor: colors.gray200, flex: 1 },
  label: { fontSize: 11, color: colors.gray400, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  value: { fontSize: 22, fontWeight: '700', marginVertical: 4 },
  sub: { fontSize: 11, color: colors.gray600 },
});

// ─── CLIENT ID BADGE ──────────────────────────────────────────────────────────
export function ClientIdBadge({ id }: { id: string }) {
  return (
    <View style={cliStyles.container}>
      <Text style={cliStyles.text}>🆔 {id}</Text>
    </View>
  );
}

const cliStyles = StyleSheet.create({
  container: { backgroundColor: colors.violetPale, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  text: { fontSize: 11, color: colors.violet, fontWeight: '700', fontVariant: ['tabular-nums'] },
});

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <View style={emptyStyles.container}>
      <Text style={emptyStyles.icon}>{icon}</Text>
      <Text style={emptyStyles.title}>{title}</Text>
      {sub ? <Text style={emptyStyles.sub}>{sub}</Text> : null}
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 20 },
  icon: { fontSize: 40, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '600', color: colors.gray600, marginBottom: 6 },
  sub: { fontSize: 13, color: colors.gray400, textAlign: 'center' },
});

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
interface SHProps {
  title: string;
  sub?: string;
  right?: React.ReactNode;
}

export function SectionHeader({ title, sub, right }: SHProps) {
  return (
    <View style={shStyles.row}>
      <View style={{ flex: 1 }}>
        <Text style={shStyles.title}>{title}</Text>
        {sub ? <Text style={shStyles.sub}>{sub}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const shStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  title: { fontSize: 16, fontWeight: '700', color: colors.violetDark },
  sub: { fontSize: 12, color: colors.gray400, marginTop: 2 },
});

