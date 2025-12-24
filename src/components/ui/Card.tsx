import React from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'elevated', ...rest }) => (
  <View style={[styles.card, variant === 'outlined' && styles.outlined, variant === 'filled' && styles.filled, style]} {...rest}>
    {typeof children === 'string' ? <Text>{children}</Text> : children}
  </View>
)

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  filled: {
    shadowOpacity: 0,
    elevation: 0,
  },
})
