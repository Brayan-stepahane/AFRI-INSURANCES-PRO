/**
 * Design System Architecture
 * 
 * Unified design tokens and patterns for consistent UI/UX across all screens
 * This file serves as the single source of truth for design constants
 */

import { colors, spacing, radius } from './config/theme';

/**
 * Layout Constants
 */
export const LAYOUT = {
  // Web
  SIDEBAR_WIDTH: 240,
  CONTENT_MAX_WIDTH: 1200,
  
  // Mobile
  SCREEN_PADDING: spacing.xl,
  MODAL_MAX_WIDTH: 650,
  MODAL_MAX_HEIGHT: '90vh',
};

/**
 * Component Base Styles
 */
export const COMPONENT_STYLES = {
  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.gray200,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  // Buttons
  button: {
    primary: {
      backgroundColor: colors.orange,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radius.sm,
      elevation: 2,
      shadowColor: colors.orange,
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    secondary: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.gray200,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radius.sm,
    },
  },

  // Inputs
  input: {
    backgroundColor: colors.gray50,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.gray200,
    color: colors.gray800,
  },

  // Badges
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 10,
    fontWeight: '700',
  },

  // Modals
  modal: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
};

/**
 * Color Palette
 */
export const COLOR_PALETTE = {
  primary: colors.violetDark,
  secondary: colors.orange,
  success: colors.success,
  danger: colors.danger,
  warning: colors.warning,
  info: colors.info,
  neutral: {
    white: colors.white,
    gray50: colors.gray50,
    gray100: colors.gray100,
    gray200: colors.gray200,
    gray400: colors.gray400,
    gray600: colors.gray600,
    gray800: colors.gray800,
  },
};

/**
 * Spacing Scale
 */
export const SPACING_SCALE = {
  xs: spacing.xs,    // 4px
  sm: spacing.sm,    // 8px
  md: spacing.md,    // 12px
  lg: spacing.lg,    // 16px
  xl: spacing.xl,    // 24px
  xxxl: spacing.xxxl, // 32px
};

/**
 * Border Radius Scale
 */
export const RADIUS_SCALE = {
  sm: radius.sm,
  md: radius.md,
  lg: radius.lg,
};

/**
 * Typography Styles
 */
export const TEXT_STYLES = {
  h1: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  h3: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  body: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  caption: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 12,
  },
};

/**
 * Status Colors
 */
export const STATUS_COLORS = {
  contractConclu: { bg: colors.successBg, text: colors.success },
  pending: { bg: colors.warningBg, text: colors.warning },
  urgent: { bg: colors.dangerBg, text: colors.danger },
  info: { bg: colors.infoBg, text: colors.info },
};

/**
 * Animation Durations (ms)
 */
export const ANIMATION = {
  faster: 150,
  fast: 250,
  normal: 400,
  slow: 600,
};

export default {
  LAYOUT,
  COMPONENT_STYLES,
  COLOR_PALETTE,
  SPACING_SCALE,
  RADIUS_SCALE,
  TEXT_STYLES,
  STATUS_COLORS,
  ANIMATION,
};
