import { create } from 'zustand'
import { COLUMNS, TABLES } from '@/constants/db'
import { supabase } from '../lib/supabase'

export type NotificationType =
    | 'request_created'
    | 'request_updated'
    | 'request_assigned'
    | 'request_accepted'
    | 'request_rejected'
    | 'request_started'
    | 'request_completed'
    | 'request_cancelled'
    | 'new_message'
    | 'system'

export interface Notification {
    id: string
    user_id: string
    type: NotificationType
    title: string
    message: string
    action_url?: string
    reference_id?: string
    reference_type?: string
    metadata?: Record<string, unknown>
    is_read: boolean
    read_at?: string
    created_at: string
}

interface NotificationState {
    notifications: Notification[]
    unreadCount: number
    loading: boolean
    error: string | null

    // Actions
    fetchNotifications: () => Promise<void>
    markAsRead: (notificationId: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    deleteNotification: (notificationId: string) => Promise<void>
    clearAll: () => Promise<void>
    refresh: () => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,

    fetchNotifications: async () => {
        set({ loading: true, error: null })
        try {
            const { data, error } = await supabase
                .from(TABLES.NOTIFICATIONS)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50)

            if (error) throw error

            const notifications = (data || []) as Notification[]
            const unreadCount = notifications.filter(n => !n.is_read).length

            set({
                notifications,
                unreadCount,
                loading: false
            })
        } catch (err: unknown) {
            const error = err as Error
            console.error('Failed to fetch notifications:', error)
            set({ error: error.message || 'Failed to fetch notifications', loading: false })
        }
    },

    markAsRead: async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from(TABLES.NOTIFICATIONS)
                .update({
                    is_read: true,
                    read_at: new Date().toISOString()
                })
                .eq('id', notificationId)

            if (error) throw error

            set(state => {
                const notifications = state.notifications.map(notif =>
                    notif.id === notificationId && !notif.is_read
                        ? { ...notif, is_read: true, read_at: new Date().toISOString() }
                        : notif
                )
                const unreadCount = notifications.filter(n => !n.is_read).length

                return { notifications, unreadCount }
            })
        } catch (err: unknown) {
            const error = err as Error
            console.error('Failed to mark notification as read:', error)
            set({ error: error.message || 'Failed to mark notification as read' })
        }
    },

    markAllAsRead: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error } = await supabase
                .from(TABLES.NOTIFICATIONS)
                .update({
                    is_read: true,
                    read_at: new Date().toISOString()
                })
                .eq('user_id', user.id)
                .eq('is_read', false)

            if (error) throw error

            set(state => ({
                notifications: state.notifications.map(notif =>
                    !notif.is_read
                        ? { ...notif, is_read: true, read_at: new Date().toISOString() }
                        : notif
                ),
                unreadCount: 0
            }))
        } catch (err: unknown) {
            const error = err as Error
            console.error('Failed to mark all notifications as read:', error)
            set({ error: error.message || 'Failed to mark all notifications as read' })
        }
    },

    deleteNotification: async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from(TABLES.NOTIFICATIONS)
                .delete()
                .eq('id', notificationId)

            if (error) throw error

            set(state => {
                const notifications = state.notifications.filter(n => n.id !== notificationId)
                const unreadCount = notifications.filter(n => !n.is_read).length

                return { notifications, unreadCount }
            })
        } catch (err: unknown) {
            const error = err as Error
            console.error('Failed to delete notification:', error)
            set({ error: error.message || 'Failed to delete notification' })
        }
    },

    clearAll: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error } = await supabase
                .from(TABLES.NOTIFICATIONS)
                .delete()
                .eq('user_id', user.id)

            if (error) throw error

            set({ notifications: [], unreadCount: 0 })
        } catch (err: unknown) {
            const error = err as Error
            console.error('Failed to clear notifications:', error)
            set({ error: error.message || 'Failed to clear notifications' })
        }
    },

    refresh: async () => {
        await get().fetchNotifications()
    },
}))
