import { useColors } from '@/hooks/use-colors';
import React from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'elevated', ...rest }) => {
  const colors = useColors();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, shadowColor: colors.shadow },
        variant === 'outlined' && [styles.outlined, { borderColor: colors.border }],
        variant === 'filled' && styles.filled,
        style
      ]}
      {...rest}
    >
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  outlined: {
    borderWidth: 1,
    shadowOpacity: 0,
    elevation: 0,
  },
  filled: {
    shadowOpacity: 0,
    elevation: 0,
  },
})
