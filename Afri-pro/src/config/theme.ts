export const colors = {
  // Primary colors
  violet: '#6B2D8B',
  violetDark: '#4A1E61',
  violetLight: '#8B3DAF',
  violetPale: '#F0E6F6',

  // Secondary colors
  orange: '#E8521A',
  orangeHover: '#C4410F',
  orangeLight: '#FFF0EB',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#F8F7FA',
  gray100: '#F0EDF4',
  gray200: '#DDD6E8',
  gray400: '#9B8FB0',
  gray600: '#5C5270',
  gray800: '#2D1F3D',

  // Status colors
  success: '#1A8A4A',
  successBg: '#E6F7EE',
  warning: '#B87514',
  warningBg: '#FEF3DC',
  danger: '#C02020',
  dangerBg: '#FDEAEA',
  info: '#1A5FA8',
  infoBg: '#E6F0FB',

  // Additional
  teal: '#0F6E56',
  tealBg: '#E1F5EE',

  // Aliases for compatibility
  primary: '#E8521A',
  secondary: '#6B2D8B',
  background: '#FFFFFF',
  surface: '#F8F7FA',
  text: '#2D1F3D',
  textSecondary: '#5C5270',
  border: '#DDD6E8',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const typography = {
  displayLarge: { fontSize: 36, fontWeight: '800' as const },
  displayMedium: { fontSize: 28, fontWeight: '700' as const },
  h1: { fontSize: 26, fontWeight: '700' as const },
  h2: { fontSize: 24, fontWeight: '600' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodyBold: { fontSize: 14, fontWeight: '500' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
  smallBold: { fontSize: 13, fontWeight: '600' as const },
  tiny: { fontSize: 12, fontWeight: '400' as const },
  tinyBold: { fontSize: 11, fontWeight: '700' as const },
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 99,
};

export const shadows = {
  sm: {
    elevation: 3,
    boxShadow: '0 2px 4px rgba(107, 45, 139, 0.1)',
  } as any,
  lg: {
    elevation: 8,
    boxShadow: '0 8px 16px rgba(107, 45, 139, 0.18)',
  } as any,
};

// ─── STATUS BADGE COLORS ──────────────────────────────────────────────────────
export const STATUT_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  // Prospections
  'Premier contact': { bg: colors.infoBg, text: colors.info },
  'Relance 1': { bg: colors.warningBg, text: colors.warning },
  'Relance 2': { bg: colors.warningBg, text: colors.warning },
  'Cotation envoyée': { bg: colors.violetPale, text: colors.violet },
  'En attente signature': { bg: colors.tealBg, text: colors.teal },
  'Contrat conclu': { bg: colors.successBg, text: colors.success },
  'Perdu': { bg: colors.dangerBg, text: colors.danger },

  // Cotations
  'En attente': { bg: colors.warningBg, text: colors.warning },
  'Validée': { bg: colors.successBg, text: colors.success },
  'Refusée': { bg: colors.dangerBg, text: colors.danger },
  'Convertie en vente': { bg: colors.successBg, text: colors.success },
};

