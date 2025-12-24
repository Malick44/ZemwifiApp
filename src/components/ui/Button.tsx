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
  const content = children || label;
  return (
    <Pressable 
      style={[
        styles.button,
        size === 'sm' && styles.sm,
        size === 'lg' && styles.lg,
        variant === 'secondary' && styles.secondary,
        variant === 'tertiary' && styles.tertiary,
        variant === 'ghost' && styles.ghost,
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
      {loading ? <ActivityIndicator color="#fff" accessibilityLabel="Loading" /> : <Text style={styles.label}>{content}</Text>}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  label: { color: '#fff', fontWeight: '600' },
  disabled: { opacity: 0.6 },
  sm: { paddingVertical: 8, paddingHorizontal: 12 },
  lg: { paddingVertical: 16, paddingHorizontal: 24 },
  secondary: { backgroundColor: '#F3F4F6' },
  tertiary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#E5E7EB' },
  ghost: { backgroundColor: 'transparent' },
  fullWidth: { width: '100%' },
})
