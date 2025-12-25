import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Pressable, StyleSheet, useColorScheme, View, ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { Colors } from '../../../constants/theme'
import { Typography } from './Typography'

type ActionButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'glass'
type ActionButtonSize = 'sm' | 'md' | 'lg'

interface ActionButtonProps {
    label: string
    onPress: () => void
    variant?: ActionButtonVariant
    size?: ActionButtonSize
    icon?: keyof typeof Ionicons.glyphMap
    iconPosition?: 'left' | 'right'
    disabled?: boolean
    badge?: number
    fullWidth?: boolean
    style?: ViewStyle
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function ActionButton({
    label,
    onPress,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    disabled = false,
    badge,
    fullWidth = false,
    style,
}: ActionButtonProps) {
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']
    const scale = useSharedValue(1)

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    const handlePressIn = () => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 300 })
    }

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 })
    }

    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    backgroundColor: colors.tint,
                    borderWidth: 0,
                }
            case 'secondary':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderColor: colors.border,
                }
            case 'success':
                return {
                    backgroundColor: colors.success,
                    borderWidth: 0,
                }
            case 'warning':
                return {
                    backgroundColor: colors.warning,
                    borderWidth: 0,
                }
            case 'danger':
                return {
                    backgroundColor: colors.error,
                    borderWidth: 0,
                }
            case 'glass':
                return {
                    backgroundColor: colorScheme === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.05)',
                    borderWidth: 1,
                    borderColor: colorScheme === 'dark'
                        ? 'rgba(255, 255, 255, 0.2)'
                        : 'rgba(0, 0, 0, 0.1)',
                }
        }
    }

    const getTextColor = () => {
        if (variant === 'secondary' || variant === 'glass') {
            return colors.text
        }
        return '#FFFFFF'
    }

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return {
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    iconSize: 16,
                }
            case 'md':
                return {
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    iconSize: 20,
                }
            case 'lg':
                return {
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    borderRadius: 16,
                    iconSize: 24,
                }
        }
    }

    const variantStyles = getVariantStyles()
    const sizeStyles = getSizeStyles()
    const textColor = getTextColor()

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={[
                styles.button,
                variantStyles,
                {
                    paddingVertical: sizeStyles.paddingVertical,
                    paddingHorizontal: sizeStyles.paddingHorizontal,
                    borderRadius: sizeStyles.borderRadius,
                    opacity: disabled ? 0.5 : 1,
                },
                fullWidth && styles.fullWidth,
                animatedStyle,
                style,
            ]}
        >
            <View style={styles.content}>
                {icon && iconPosition === 'left' && (
                    <Ionicons
                        name={icon}
                        size={sizeStyles.iconSize}
                        color={textColor}
                        style={styles.iconLeft}
                    />
                )}
                <Typography
                    variant={size === 'sm' ? 'caption' : size === 'lg' ? 'h4' : 'body'}
                    style={[
                        styles.label,
                        { color: textColor, fontWeight: '600' },
                    ]}
                >
                    {label}
                </Typography>
                {icon && iconPosition === 'right' && (
                    <Ionicons
                        name={icon}
                        size={sizeStyles.iconSize}
                        color={textColor}
                        style={styles.iconRight}
                    />
                )}
                {badge !== undefined && badge > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.error }]}>
                        <Typography variant="caption" style={styles.badgeText}>
                            {badge > 99 ? '99+' : badge}
                        </Typography>
                    </View>
                )}
            </View>
        </AnimatedPressable>
    )
}

const styles = StyleSheet.create({
    button: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    fullWidth: {
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    label: {
        textAlign: 'center',
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
    badge: {
        position: 'absolute',
        top: -8,
        right: -8,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        paddingHorizontal: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
})
