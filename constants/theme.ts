/**
 * ZemNet Design System - Colors, Typography, and Spacing
 * Based on the ZemNet brand and UI specifications
 */

import { Platform } from 'react-native';

// ZemNet Brand Colors
export const BrandColors = {
  primary: '#0066CC', // ZemNet Blue
  primaryDark: '#0052A3',
  primaryLight: '#3385D6',
  secondary: '#F59E0B', // Amber for highlights
  success: '#10B981', // Green for online/success
  warning: '#F59E0B', // Amber for pending
  error: '#EF4444', // Red for offline/errors
  info: '#3B82F6', // Blue for information
};

// Gray Scale
export const GrayColors = {
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

// Extended Brand Colors
export const ExtendedColors = {
  purple: '#8B5CF6',
  purpleDark: '#7C3AED',
  purpleLight: '#A78BFA',
  teal: '#14B8A6',
  tealDark: '#0D9488',
  tealLight: '#2DD4BF',
  blue: '#3B82F6',
  blueDark: '#2563EB',
  blueLight: '#60A5FA',
  green: '#10B981',
  greenDark: '#059669',
  greenLight: '#34D399',
  red: '#EF4444',
  redDark: '#DC2626',
  redLight: '#F87171',
  orange: '#F59E0B',
  orangeDark: '#D97706',
  orangeLight: '#FBBF24',
};

// Semantic Colors
export const Colors = {
  light: {
    // Text
    text: GrayColors.gray900,
    textSecondary: GrayColors.gray600,
    textTertiary: GrayColors.gray500,
    textInverse: '#FFFFFF',
    mutedForeground: GrayColors.gray600,
    link: '#2563EB',
    linkHover: '#1D4ED8',

    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: GrayColors.gray50,
    backgroundTertiary: GrayColors.gray100,
    card: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSecondary: GrayColors.gray50,
    surfaceTertiary: GrayColors.gray100,

    // Status Backgrounds
    successBackground: '#DCFCE7',
    warningBackground: '#FEF3C7',
    errorBackground: '#FEE2E2',
    infoBackground: '#EFF6FF',

    // Brand
    primary: BrandColors.primary,
    primaryHover: BrandColors.primaryDark,
    primaryLight: BrandColors.primaryLight,
    secondary: BrandColors.secondary,
    success: BrandColors.success,
    warning: BrandColors.warning,
    error: BrandColors.error,
    info: BrandColors.info,

    // UI Elements
    border: GrayColors.gray200,
    borderLight: GrayColors.gray100,
    borderFocus: BrandColors.primary,
    shadow: 'rgba(0, 0, 0, 0.1)',

    // Overlays (various opacity levels)
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayHeavy: 'rgba(0, 0, 0, 0.7)',
    overlayWhite: 'rgba(255, 255, 255, 0.95)',
    overlayWhiteLight: 'rgba(255, 255, 255, 0.8)',
    overlayWhiteMedium: 'rgba(255, 255, 255, 0.6)',

    // Status
    online: BrandColors.success,
    offline: GrayColors.gray400,
    pending: BrandColors.warning,
    processing: GrayColors.gray500,

    // Extended Semantic Colors
    premium: ExtendedColors.purple,
    accent: ExtendedColors.teal,
    disabled: GrayColors.gray400,
    disabledBackground: GrayColors.gray100,

    // Icons & Tabs
    icon: GrayColors.gray600,
    iconActive: BrandColors.primary,
    tabIconDefault: GrayColors.gray500,
    tabIconSelected: BrandColors.primary,
    tint: BrandColors.primary,
  },
  dark: {
    // Text
    text: '#FFFFFF',
    textSecondary: GrayColors.gray300,
    textTertiary: GrayColors.gray400,
    textInverse: GrayColors.gray900,
    mutedForeground: GrayColors.gray400,
    link: '#60A5FA',
    linkHover: '#93C5FD',

    // Backgrounds
    background: GrayColors.gray900,
    backgroundSecondary: GrayColors.gray800,
    backgroundTertiary: GrayColors.gray700,
    card: GrayColors.gray800,
    surface: GrayColors.gray800,
    surfaceSecondary: GrayColors.gray700,
    surfaceTertiary: GrayColors.gray600,

    // Status Backgrounds
    successBackground: '#064E3B',
    warningBackground: '#78350F',
    errorBackground: '#7F1D1D',
    infoBackground: '#1E3A8A',

    // Brand (slightly adjusted for dark mode)
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    primaryLight: '#60A5FA',
    secondary: '#F59E0B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#60A5FA',

    // UI Elements
    border: GrayColors.gray700,
    borderLight: GrayColors.gray600,
    borderFocus: '#3B82F6',
    shadow: 'rgba(0, 0, 0, 0.3)',

    // Overlays (various opacity levels)
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',
    overlayHeavy: 'rgba(0, 0, 0, 0.9)',
    overlayWhite: 'rgba(255, 255, 255, 0.1)',
    overlayWhiteLight: 'rgba(255, 255, 255, 0.05)',
    overlayWhiteMedium: 'rgba(255, 255, 255, 0.15)',

    // Status
    online: '#10B981',
    offline: GrayColors.gray600,
    pending: '#F59E0B',
    processing: GrayColors.gray400,

    // Extended Semantic Colors
    premium: ExtendedColors.purpleLight,
    accent: ExtendedColors.tealLight,
    disabled: GrayColors.gray600,
    disabledBackground: GrayColors.gray800,

    // Icons & Tabs
    icon: GrayColors.gray400,
    iconActive: '#3B82F6',
    tabIconDefault: GrayColors.gray400,
    tabIconSelected: '#3B82F6',
    tint: '#3B82F6',
  },
};

// Typography Scale
export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const LineHeights = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Spacing Scale (based on 4px grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
};

// Border Radius
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Shadows
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Common Sizes
export const Sizes = {
  buttonHeight: 48,
  inputHeight: 48,
  iconSize: 24,
  avatarSm: 32,
  avatarMd: 48,
  avatarLg: 64,
  minTouchTarget: 44, // Accessibility guideline
};

// Color Utility Functions
export const ColorUtils = {
  /**
   * Convert hex color to rgba with opacity
   * @param hex - Hex color code (e.g., '#FF0000')
   * @param opacity - Opacity value between 0 and 1
   */
  withOpacity: (hex: string, opacity: number): string => {
    // Remove # if present
    const cleanHex = hex.replace('#', '');

    // Parse hex to RGB
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },

  /**
   * Get color for status badge
   * @param status - Status type
   * @param theme - 'light' or 'dark'
   */
  getStatusColor: (
    status: 'success' | 'error' | 'warning' | 'info' | 'pending' | 'online' | 'offline' | 'processing',
    theme: 'light' | 'dark' = 'light'
  ): string => {
    const colorMap = {
      success: Colors[theme].success,
      error: Colors[theme].error,
      warning: Colors[theme].warning,
      info: Colors[theme].info,
      pending: Colors[theme].pending,
      online: Colors[theme].online,
      offline: Colors[theme].offline,
      processing: Colors[theme].processing,
    };
    return colorMap[status] || Colors[theme].text;
  },

  /**
   * Get background color for status badge
   * @param status - Status type
   * @param theme - 'light' or 'dark'
   */
  getStatusBackground: (
    status: 'success' | 'error' | 'warning' | 'info',
    theme: 'light' | 'dark' = 'light'
  ): string => {
    const colorMap = {
      success: Colors[theme].successBackground,
      error: Colors[theme].errorBackground,
      warning: Colors[theme].warningBackground,
      info: Colors[theme].infoBackground,
    };
    return colorMap[status] || Colors[theme].backgroundSecondary;
  },

  /**
   * Get surface color by elevation level
   * @param level - Elevation level (0-2)
   * @param theme - 'light' or 'dark'
   */
  getSurfaceColor: (level: 0 | 1 | 2, theme: 'light' | 'dark' = 'light'): string => {
    const surfaces = [
      Colors[theme].surface,
      Colors[theme].surfaceSecondary,
      Colors[theme].surfaceTertiary,
    ];
    return surfaces[level] || Colors[theme].surface;
  },
};
