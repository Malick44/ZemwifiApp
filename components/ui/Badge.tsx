import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Typography } from './Typography';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends ViewProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  label: string;
}

export function Badge({
  variant = 'neutral',
  size = 'md',
  label,
  style,
  ...props
}: BadgeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const variantStyles = {
    success: {
      backgroundColor: `${colors.success}15`,
      borderColor: colors.success,
    },
    warning: {
      backgroundColor: `${colors.warning}15`,
      borderColor: colors.warning,
    },
    error: {
      backgroundColor: `${colors.error}15`,
      borderColor: colors.error,
    },
    info: {
      backgroundColor: `${colors.info}15`,
      borderColor: colors.info,
    },
    neutral: {
      backgroundColor: colors.backgroundTertiary,
      borderColor: colors.border,
    },
  };

  const variantTextColors = {
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    neutral: colors.textSecondary,
  };

  const sizeStyles = {
    sm: {
      paddingHorizontal: Spacing.xs,
      paddingVertical: 2,
    },
    md: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
    },
    lg: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
    },
  };

  return (
    <View
      style={[
        styles.badge,
        variantStyles[variant],
        sizeStyles[size],
        style,
      ]}
      {...props}
    >
      <Typography
        variant={size === 'sm' ? 'caption' : 'bodySmall'}
        weight="medium"
        style={{ color: variantTextColors[variant] }}
      >
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
