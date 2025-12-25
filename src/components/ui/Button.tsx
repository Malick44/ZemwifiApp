import { useColors } from '@/hooks/use-colors';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

export interface ButtonProps {
  label?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  children,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  size = 'md',
  fullWidth,
  leftIcon,
  style
}) => {
  const colors = useColors();
  const content = children || label;

  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: colors.backgroundSecondary };
      case 'tertiary':
        return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getTextColor = () => {
    if (variant === 'secondary') return colors.text;
    if (variant === 'tertiary') return colors.text;
    if (variant === 'ghost') return colors.primary;
    return colors.textInverse;
  };

  return (
    <Pressable
      style={[
        styles.button,
        getVariantStyle(),
        size === 'sm' && styles.sm,
        size === 'lg' && styles.lg,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={typeof content === 'string' ? content : label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {leftIcon}
      {loading ? (
        <ActivityIndicator color={getTextColor()} accessibilityLabel="Loading" />
      ) : (
        <Text style={[styles.label, { color: getTextColor() }]}>{content}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  label: { fontWeight: '600' },
  disabled: { opacity: 0.6 },
  sm: { paddingVertical: 8, paddingHorizontal: 12 },
  lg: { paddingVertical: 16, paddingHorizontal: 24 },
  fullWidth: { width: '100%' },
})

