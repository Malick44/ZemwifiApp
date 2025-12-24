import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'error' | 'warning' | 'neutral';
  tone?: 'success' | 'info' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant, tone = 'info', size = 'md' }) => (
  <View style={[styles.badge, styles[tone]]}>
    <Text style={styles.text}>{label}</Text>
  </View>
)

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: { color: '#fff', fontSize: 12 },
  info: { backgroundColor: '#2563eb' },
  success: { backgroundColor: '#16a34a' },
  danger: { backgroundColor: '#dc2626' },
  primary: { backgroundColor: '#2563eb' },
  error: { backgroundColor: '#dc2626' },
  warning: { backgroundColor: '#F59E0B' },
  neutral: { backgroundColor: '#6B7280' },
})
