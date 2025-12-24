import { Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from './Button';
import { Card } from './Card';
import { Typography } from './Typography';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Une erreur est survenue',
  message,
  onRetry,
  retryLabel = 'Réessayer',
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Card variant="outlined" style={styles.card}>
        <Typography variant="h3" color="error" style={styles.title}>
          {title}
        </Typography>
        
        <Typography
          variant="body"
          color="secondary"
          align="center"
          style={styles.message}
        >
          {message}
        </Typography>
        
        {onRetry && (
          <Button
            variant="outline"
            size="md"
            onPress={onRetry}
            fullWidth
            style={styles.button}
          >
            {retryLabel}
          </Button>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    marginBottom: Spacing.sm,
  },
  message: {
    marginBottom: Spacing.lg,
  },
  button: {
    marginTop: Spacing.md,
  },
});
