import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { Colors } from '../../../constants/theme'
import { Notification } from '../../stores/notificationStore'
import { Typography } from '../ui/Typography'

interface NotificationItemProps {
    notification: Notification
    onPress: (notification: Notification) => void
}

export const NotificationItem = ({ notification, onPress }: NotificationItemProps) => {
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']

    const getIcon = () => {
        switch (notification.type) {
            case 'new_message': return 'chatbubble'
            case 'request_assigned': return 'person-add'
            case 'request_completed': return 'checkmark-circle'
            case 'request_cancelled': return 'close-circle'
            case 'system': return 'information-circle'
            default: return 'notifications'
        }
    }

    const getColor = () => {
        switch (notification.type) {
            case 'new_message': return colors.primary
            case 'request_assigned': return colors.info
            case 'request_completed': return colors.success
            case 'request_cancelled': return colors.error
            case 'system': return colors.warning
            default: return colors.primary
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()

        // Less than 24h
        if (diff < 24 * 60 * 60 * 1000) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        // Yesterday
        if (diff < 48 * 60 * 60 * 1000) {
            return 'Hier'
        }
        // Date
        return date.toLocaleDateString()
    }

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { backgroundColor: notification.is_read ? 'transparent' : colors.primary + '08' }
            ]}
            onPress={() => onPress(notification)}
        >
            <View style={[styles.iconContainer, { backgroundColor: getColor() + '15' }]}>
                <Ionicons name={getIcon()} size={24} color={getColor()} />
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Typography variant="body" weight="bold" style={{ flex: 1 }}>
                        {notification.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        {formatTime(notification.created_at)}
                    </Typography>
                </View>

                <Typography
                    variant="body"
                    color="textSecondary"
                    numberOfLines={2}
                    style={{ marginTop: 4 }}
                >
                    {notification.message}
                </Typography>
            </View>

            {!notification.is_read && (
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
})
