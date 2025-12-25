import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useRef } from 'react'
import {
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    Platform,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native'
import { Colors } from '../../../constants/theme'
import { Typography } from './Typography'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

interface BottomSheetProps {
    visible: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    snapPoint?: number // Height percentage (0-1)
}

export function BottomSheet({
    visible,
    onClose,
    title,
    children,
    snapPoint = 0.4,
}: BottomSheetProps) {
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']

    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current
    const backdropOpacity = useRef(new Animated.Value(0)).current

    const sheetHeight = SCREEN_HEIGHT * snapPoint

    useEffect(() => {
        if (visible) {
            // Show animation
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 65,
                    friction: 11,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start()
        } else {
            // Hide animation
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: sheetHeight,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start()
        }
    }, [visible, sheetHeight])

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 5
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy)
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > sheetHeight * 0.3 || gestureState.vy > 0.5) {
                    // Close if dragged down more than 30% or with sufficient velocity
                    onClose()
                } else {
                    // Snap back
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 65,
                        friction: 11,
                    }).start()
                }
            },
        })
    ).current

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                {/* Backdrop */}
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
                    <Animated.View
                        style={[
                            styles.backdrop,
                            {
                                opacity: backdropOpacity,
                            },
                        ]}
                    />
                </Pressable>

                {/* Bottom Sheet */}
                <Animated.View
                    style={[
                        styles.sheetContainer,
                        {
                            backgroundColor: colors.background,
                            height: sheetHeight,
                            transform: [{ translateY }],
                        },
                    ]}
                    {...panResponder.panHandlers}
                >
                    {/* Handle */}
                    <View style={styles.handleContainer}>
                        <View style={[styles.handle, { backgroundColor: colors.border }]} />
                    </View>

                    {/* Header */}
                    {title && (
                        <View style={styles.header}>
                            <Typography variant="h4">{title}</Typography>
                            <TouchableOpacity
                                onPress={onClose}
                                style={styles.closeButton}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Content */}
                    <View style={styles.content}>{children}</View>
                </Animated.View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheetContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
})
