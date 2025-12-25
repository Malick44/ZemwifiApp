import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme'
import { NotificationItem } from '../../../../src/components/ui/NotificationItem'
import { Typography } from '../../../../src/components/ui/Typography'
import { Notification, useNotificationStore } from '../../../../src/stores/notificationStore'

export default function NotificationsScreen() {
    const router = useRouter()
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']

    const { notifications, fetchNotifications, markAsRead, markAllAsRead, refresh, loading } = useNotificationStore()
    const [refreshing, setRefreshing] = useState(false)
    const [filter, setFilter] = useState<'all' | 'unread' | 'requests'>('all')

    useEffect(() => {
        fetchNotifications()
    }, [])

    const handleRefresh = async () => {
        setRefreshing(true)
        await refresh()
        setRefreshing(false)
    }

    const handleNotificationPress = async (notification: Notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id)
        }

        if (notification.action_url) {
            router.push(notification.action_url as any)
        }
    }

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true
        if (filter === 'unread') return !n.is_read
        if (filter === 'requests') return n.type.startsWith('request_')
        return true
    })

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <View style={{ width: 40 }}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
                <Typography variant="h3" style={{ flex: 1, textAlign: 'center' }}>Notifications</Typography>
                <TouchableOpacity onPress={() => markAllAsRead()} style={{ width: 40 }}>
                    <Ionicons name="checkmark-done-circle-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.tabs}>
                {[
                    { key: 'all', label: 'Toutes' },
                    { key: 'unread', label: 'Non lues' },
                    { key: 'requests', label: 'Suivi' },
                ].map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            styles.tab,
                            filter === tab.key && { backgroundColor: colors.secondary, borderColor: colors.primary }
                        ]}
                        onPress={() => setFilter(tab.key as any)}
                    >
                        <Typography
                            variant="caption"
                            style={{
                                fontWeight: filter === tab.key ? 'bold' : 'normal',
                                color: filter === tab.key ? colors.primary : colors.textSecondary
                            }}
                        >
                            {tab.label}
                        </Typography>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            >
                {loading && notifications.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <Typography variant="body" color="textSecondary">Chargement...</Typography>
                    </View>
                ) : filteredNotifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={64} color={colors.disabled} />
                        <Typography variant="h4" style={{ marginTop: 16 }}>Aucune notification</Typography>
                        <Typography variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: 8 }}>
                            Vous n'avez aucune notification pour le moment.
                        </Typography>
                    </View>
                ) : (
                    filteredNotifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onPress={handleNotificationPress}
                        />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 0,
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    tab: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    content: {
        paddingBottom: 40,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 40,
    },
})
