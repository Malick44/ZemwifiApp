import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Pressable, PressableProps, StyleSheet, View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: keyof typeof Spacing;
  onPress?: PressableProps['onPress'];
}

export function Card({
  variant = 'elevated',
  padding = 'md',
  onPress,
  style,
  children,
  ...props
}: CardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const variantStyles = {
    elevated: [
      styles.card,
      { backgroundColor: colors.background },
      Shadows.md,
    ],
    outlined: [
      styles.card,
      {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
      },
    ],
    filled: [
      styles.card,
      { backgroundColor: colors.backgroundSecondary },
    ],
  };

  const paddingStyle = { padding: Spacing[padding] };

  const content = (
    <View
      style={[variantStyles[variant], paddingStyle, style]}
      {...props}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
});
