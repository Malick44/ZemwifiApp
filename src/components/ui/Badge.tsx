import { useColors } from '@/hooks/use-colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface BadgeProps {
  label?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'success' | 'error' | 'warning' | 'neutral';
  tone?: 'success' | 'info' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ label, children, variant, tone = 'info', size = 'md' }) => {
  const colors = useColors();

  const getBackgroundColor = () => {
    if (variant === 'success') return colors.success;
    if (variant === 'error') return colors.error;
    if (variant === 'warning') return colors.warning;
    if (variant === 'neutral') return colors.gray.gray600;
    if (variant === 'primary') return colors.primary;

    // Fallback to tone
    if (tone === 'success') return colors.success;
    if (tone === 'danger') return colors.error;
    return colors.info;
  };

  return (
    <View style={[styles.badge, { backgroundColor: getBackgroundColor() }]}>
      <Text style={[styles.text, { color: colors.textInverse }]}>{children || label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12 },
})

