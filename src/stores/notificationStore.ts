import { create } from 'zustand'

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
    metadata?: Record<string, any>
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

// Mock data generator
const generateMockNotifications = (): Notification[] => [
    {
        id: 'notif-1',
        user_id: 'host-1',
        type: 'request_assigned',
        title: 'Technicien assigné',
        message: 'Moussa Ouedraogo a été assigné à votre demande "Routeur hors ligne"',
        action_url: '/(app)/(host)/technician-requests/1',
        reference_id: '1',
        reference_type: 'service_request',
        is_read: false,
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'notif-2',
        user_id: 'host-1',
        type: 'new_message',
        title: 'Nouveau message',
        message: 'Moussa Ouedraogo a envoyé un message concernant: Routeur hors ligne',
        action_url: '/(app)/(host)/technician-requests/1',
        reference_id: 'msg-4',
        reference_type: 'message',
        metadata: { request_id: '1', sender_id: 'tech-1' },
        is_read: false,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
        id: 'notif-3',
        user_id: 'host-1',
        type: 'request_started',
        title: 'Intervention démarrée',
        message: 'Le technicien a commencé l\'intervention pour "Problème de configuration"',
        action_url: '/(app)/(host)/technician-requests/2',
        reference_id: '2',
        reference_type: 'service_request',
        is_read: true,
        read_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'notif-4',
        user_id: 'host-1',
        type: 'request_completed',
        title: 'Intervention terminée',
        message: 'L\'intervention "Installation antenne" a été complétée avec succès',
        action_url: '/(app)/(host)/technician-requests/3',
        reference_id: '3',
        reference_type: 'service_request',
        is_read: true,
        read_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'notif-5',
        user_id: 'host-1',
        type: 'system',
        title: 'Mise à jour système',
        message: 'Une nouvelle version de l\'application est disponible',
        is_read: true,
        read_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
]

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,

    fetchNotifications: async () => {
        set({ loading: true, error: null })
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500))
            const mockNotifications = generateMockNotifications()
            const unreadCount = mockNotifications.filter(n => !n.is_read).length

            set({
                notifications: mockNotifications,
                unreadCount,
                loading: false
            })
        } catch (_error) {
            set({ error: 'Failed to fetch notifications', loading: false })
        }
    },

    markAsRead: async (notificationId: string) => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 200))

            set(state => {
                const notifications = state.notifications.map(notif =>
                    notif.id === notificationId && !notif.is_read
                        ? { ...notif, is_read: true, read_at: new Date().toISOString() }
                        : notif
                )
                const unreadCount = notifications.filter(n => !n.is_read).length

                return { notifications, unreadCount }
            })
        } catch (_error) {
            set({ error: 'Failed to mark notification as read' })
        }
    },

    markAllAsRead: async () => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300))

            set(state => ({
                notifications: state.notifications.map(notif =>
                    !notif.is_read
                        ? { ...notif, is_read: true, read_at: new Date().toISOString() }
                        : notif
                ),
                unreadCount: 0
            }))
        } catch (_error) {
            set({ error: 'Failed to mark all notifications as read' })
        }
    },

    deleteNotification: async (notificationId: string) => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 200))

            set(state => {
                const notifications = state.notifications.filter(n => n.id !== notificationId)
                const unreadCount = notifications.filter(n => !n.is_read).length

                return { notifications, unreadCount }
            })
        } catch (_error) {
            set({ error: 'Failed to delete notification' })
        }
    },

    clearAll: async () => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300))

            set({ notifications: [], unreadCount: 0 })
        } catch (_error) {
            set({ error: 'Failed to clear notifications' })
        }
    },

    refresh: async () => {
        await get().fetchNotifications()
    },
}))
