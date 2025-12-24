import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Typography } from './Typography';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Chargement...' }: LoadingStateProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Typography
        variant="body"
        color="secondary"
        align="center"
        style={styles.message}
      >
        {message}
      </Typography>
    </View>
  );
}

// Skeleton loader for cards
interface SkeletonProps {
  width?: number | string;
  height?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 20, style }: SkeletonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          backgroundColor: colors.backgroundTertiary,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  message: {
    marginTop: Spacing.md,
  },
  skeleton: {
    borderRadius: 4,
  },
});
