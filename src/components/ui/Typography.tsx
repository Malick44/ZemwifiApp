import { Colors, FontSizes, FontWeights, LineHeights } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'caption' | 'label' | 'button';

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'error' | 'success' | string;
  weight?: keyof typeof FontWeights;
  align?: 'left' | 'center' | 'right';
}

export function Typography({
  variant = 'body',
  color = 'primary',
  weight,
  align,
  style,
  ...props
}: TypographyProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const variantStyles = {
    h1: styles.h1,
    h2: styles.h2,
    h3: styles.h3,
    h4: styles.h4,
    body: styles.body,
    bodySmall: styles.bodySmall,
    caption: styles.caption,
    label: styles.label,
    button: styles.button,
  };

  const colorStyles = {
    primary: { color: colors.text },
    secondary: { color: colors.textSecondary },
    tertiary: { color: colors.textTertiary },
    inverse: { color: colors.textInverse },
    error: { color: colors.error },
    success: { color: colors.success },
  };

  // Handle both predefined colors and custom color strings
  const getColorStyle = () => {
    if (color in colorStyles) {
      return colorStyles[color as keyof typeof colorStyles];
    }
    // If it's a custom color string, use it directly
    return { color };
  };

  const weightStyle = weight ? { fontWeight: FontWeights[weight] } : {};
  const alignStyle = align ? { textAlign: align } : {};

  return (
    <Text
      style={[
        variantStyles[variant],
        getColorStyle(),
        weightStyle,
        alignStyle,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes['3xl'] * LineHeights.tight,
  },
  h2: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes['2xl'] * LineHeights.tight,
  },
  h3: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes.lg * LineHeights.normal,
  },
  h4: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes.base * LineHeights.normal,
  },
  body: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.regular,
    lineHeight: FontSizes.base * LineHeights.normal,
  },
  bodySmall: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.regular,
    lineHeight: FontSizes.sm * LineHeights.normal,
  },
  caption: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.regular,
    lineHeight: FontSizes.xs * LineHeights.normal,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.xs * LineHeights.normal,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  button: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes.base * LineHeights.normal,
  },
});
