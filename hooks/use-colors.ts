/**
 * Convenient hook for accessing theme colors and utilities
 */

import { Colors, ColorUtils, ExtendedColors, GrayColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useColors() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return {
        // All theme colors for current scheme
        ...colors,

        // Direct access to color palettes
        gray: GrayColors,
        extended: ExtendedColors,

        // Utility functions (pre-bound to current theme)
        withOpacity: ColorUtils.withOpacity,
        getStatusColor: (status: Parameters<typeof ColorUtils.getStatusColor>[0]) =>
            ColorUtils.getStatusColor(status, colorScheme),
        getStatusBackground: (status: Parameters<typeof ColorUtils.getStatusBackground>[0]) =>
            ColorUtils.getStatusBackground(status, colorScheme),
        getSurfaceColor: (level: Parameters<typeof ColorUtils.getSurfaceColor>[0]) =>
            ColorUtils.getSurfaceColor(level, colorScheme),

        // Current color scheme
        colorScheme,
        isDark: colorScheme === 'dark',
    };
}
