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
};

export const shadows = {
  sm: {
    shadowColor: '#6B2D8B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    boxShadow: '0 2px 4px rgba(107, 45, 139, 0.1)',
  } as any,
  lg: {
    shadowColor: '#6B2D8B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    boxShadow: '0 8px 16px rgba(107, 45, 139, 0.18)',
  } as any,
};

