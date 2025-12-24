import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  message?: string;
  description?: string;
  icon?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  message, 
  description, 
  icon,
  action,
  actionLabel, 
  onAction 
}) => {
  const displayMessage = message || description;
  const displayAction = action || (actionLabel && onAction ? { label: actionLabel, onPress: onAction } : undefined);
  
  return (
    <View style={styles.container}>
      {icon && <Ionicons name={icon as any} size={48} color="#9CA3AF" style={styles.icon} />}
      <Text style={styles.title}>{title}</Text>
      {displayMessage && <Text style={styles.description}>{displayMessage}</Text>}
      {displayAction && <Button label={displayAction.label} onPress={displayAction.onPress} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center' },
  icon: { marginBottom: 16 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  description: { color: '#6b7280', textAlign: 'center', marginBottom: 12 },
})
