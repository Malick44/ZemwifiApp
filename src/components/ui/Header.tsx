import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { Typography } from './Typography'

export interface HeaderProps {
    // Content
    title: string
    subtitle?: string

    // Navigation
    showBack?: boolean
    onBack?: () => void

    // Actions
    rightAction?: React.ReactNode
    leftAction?: React.ReactNode

    // Style
    variant?: 'default' | 'large' | 'minimal'
    transparent?: boolean
    showBorder?: boolean

    // Custom
    children?: React.ReactNode
}

export const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    showBack = false,
    onBack,
    rightAction,
    leftAction,
    variant = 'default',
    transparent = false,
    showBorder = false,
    children,
}) => {
    const router = useRouter()
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']

    const handleBack = () => {
        if (onBack) {
            onBack()
        } else {
            router.back()
        }
    }

    // Variant-specific styles
    const containerStyle = [
        styles.container,
        variant === 'large' && styles.containerLarge,
        variant === 'minimal' && styles.containerMinimal,
        !transparent && { backgroundColor: colors.background },
        showBorder && { borderBottomWidth: 1, borderBottomColor: colors.textTertiary + '20' },
    ]

    const titleVariant = variant === 'large' ? 'h2' : 'h3'

    return (
        <View style={containerStyle}>
            {/* Left Side - Back button or custom action */}
            <View style={styles.leftSection}>
                {showBack && (
                    <TouchableOpacity
                        onPress={handleBack}
                        style={[
                            styles.backButton,
                            {
                                backgroundColor: colors.backgroundSecondary,
                                borderWidth: 1,
                                borderColor: colors.border,
                            }
                        ]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="arrow-back" size={20} color={colors.text} />
                    </TouchableOpacity>
                )}
                {leftAction && !showBack && leftAction}
            </View>

            {/* Center - Title and Subtitle */}
            <View style={styles.centerSection}>
                <Typography
                    variant={titleVariant}
                    style={styles.title}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {title}
                </Typography>
                {subtitle && (
                    <Typography
                        variant="body"
                        color={colors.textSecondary}
                        style={styles.subtitle}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {subtitle}
                    </Typography>
                )}
                {children}
            </View>

            {/* Right Side - Custom action */}
            <View style={styles.rightSection}>
                {rightAction}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingVertical: 16,
        minHeight: 80,
        zIndex: 1,
    },
    containerLarge: {
        minHeight: 120,
        paddingVertical: 24,
    },
    containerMinimal: {
        minHeight: 60,
        paddingVertical: 12,
    },
    leftSection: {
        justifyContent: 'center',
        minWidth: 44,
    },
    centerSection: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    rightSection: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        minWidth: 44,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        marginBottom: 0,
    },
    subtitle: {
        marginTop: 4,
    },
})
