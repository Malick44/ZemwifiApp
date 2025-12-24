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

// Semantic Colors
export const Colors = {
  light: {
    // Text
    text: GrayColors.gray900,
    textSecondary: GrayColors.gray600,
    textTertiary: GrayColors.gray500,
    textInverse: '#FFFFFF',
    
    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: GrayColors.gray50,
    backgroundTertiary: GrayColors.gray100,
    card: '#FFFFFF',
    errorBackground: '#FEE2E2',
    
    // Brand
    primary: BrandColors.primary,
    primaryHover: BrandColors.primaryDark,
    success: BrandColors.success,
    warning: BrandColors.warning,
    error: BrandColors.error,
    info: BrandColors.info,
    
    // UI Elements
    border: GrayColors.gray200,
    borderFocus: BrandColors.primary,
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Status
    online: BrandColors.success,
    offline: GrayColors.gray400,
    pending: BrandColors.warning,
    
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
    
    // Backgrounds
    background: GrayColors.gray900,
    backgroundSecondary: GrayColors.gray800,
    backgroundTertiary: GrayColors.gray700,
    card: GrayColors.gray800,
    errorBackground: '#7F1D1D',
    
    // Brand (slightly adjusted for dark mode)
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#60A5FA',
    
    // UI Elements
    border: GrayColors.gray700,
    borderFocus: '#3B82F6',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    
    // Status
    online: '#10B981',
    offline: GrayColors.gray600,
    pending: '#F59E0B',
    
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
