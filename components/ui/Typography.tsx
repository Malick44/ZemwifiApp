import { Colors, FontSizes, FontWeights, LineHeights } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'error' | 'success';
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
    body: styles.body,
    bodySmall: styles.bodySmall,
    caption: styles.caption,
    label: styles.label,
  };

  const colorStyles = {
    primary: { color: colors.text },
    secondary: { color: colors.textSecondary },
    tertiary: { color: colors.textTertiary },
    inverse: { color: colors.textInverse },
    error: { color: colors.error },
    success: { color: colors.success },
  };

  const weightStyle = weight ? { fontWeight: FontWeights[weight] } : {};
  const alignStyle = align ? { textAlign: align } : {};

  return (
    <Text
      style={[
        variantStyles[variant],
        colorStyles[color],
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
});
