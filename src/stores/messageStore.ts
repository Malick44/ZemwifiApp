import { create } from 'zustand'

export type MessageSenderType = 'host' | 'technician' | 'system'

export interface RequestMessage {
    id: string
    request_id: string
    sender_id: string
    sender_type: MessageSenderType
    sender_name?: string
    content: string
    attachments?: string[]
    is_read: boolean
    read_at?: string
    created_at: string
    updated_at: string
}

interface MessageState {
    messages: RequestMessage[]
    loading: boolean
    error: string | null
    currentRequestId: string | null

    // Actions
    fetchMessages: (requestId: string) => Promise<void>
    sendMessage: (requestId: string, content: string, attachments?: string[]) => Promise<RequestMessage>
    markAsRead: (messageId: string) => Promise<void>
    markAllAsRead: (requestId: string) => Promise<void>
    clearMessages: () => void
    refresh: () => Promise<void>
}

// Mock data generator
const generateMockMessages = (requestId: string): RequestMessage[] => [
    {
        id: 'msg-1',
        request_id: requestId,
        sender_id: 'host-1',
        sender_type: 'host',
        sender_name: 'Ibrahim Kaboré',
        content: 'Bonjour, le routeur ne s\'allume toujours pas. Pouvez-vous venir aujourd\'hui ?',
        is_read: true,
        read_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'msg-2',
        request_id: requestId,
        sender_id: 'tech-1',
        sender_type: 'technician',
        sender_name: 'Moussa Ouedraogo',
        content: 'Bonjour, je peux passer cet après-midi vers 14h. Est-ce que ça vous convient ?',
        is_read: true,
        read_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'msg-3',
        request_id: requestId,
        sender_id: 'host-1',
        sender_type: 'host',
        sender_name: 'Ibrahim Kaboré',
        content: 'Parfait ! Je serai sur place. Merci beaucoup.',
        is_read: true,
        read_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'msg-4',
        request_id: requestId,
        sender_id: 'tech-1',
        sender_type: 'technician',
        sender_name: 'Moussa Ouedraogo',
        content: 'Je suis en route, j\'arrive dans 10 minutes.',
        is_read: false,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
]

export const useMessageStore = create<MessageState>((set, get) => ({
    messages: [],
    loading: false,
    error: null,
    currentRequestId: null,

    fetchMessages: async (requestId: string) => {
        set({ loading: true, error: null, currentRequestId: requestId })
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 400))
            const mockMessages = generateMockMessages(requestId)
            set({ messages: mockMessages, loading: false })
        } catch (_error) {
            set({ error: 'Failed to fetch messages', loading: false })
        }
    },

    sendMessage: async (requestId: string, content: string, attachments?: string[]) => {
        set({ loading: true, error: null })
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500))

            const newMessage: RequestMessage = {
                id: `msg-${Date.now()}`,
                request_id: requestId,
                sender_id: 'host-1', // Should come from auth store
                sender_type: 'host',
                sender_name: 'Current User',
                content,
                attachments,
                is_read: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            set(state => ({
                messages: [...state.messages, newMessage],
                loading: false
            }))

            return newMessage
        } catch (_error) {
            set({ error: 'Failed to send message', loading: false })
            throw _error
        }
    },

    markAsRead: async (messageId: string) => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 200))

            set(state => ({
                messages: state.messages.map(msg =>
                    msg.id === messageId
                        ? { ...msg, is_read: true, read_at: new Date().toISOString() }
                        : msg
                )
            }))
        } catch (_error) {
            set({ error: 'Failed to mark message as read' })
        }
    },

    markAllAsRead: async (requestId: string) => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300))

            set(state => ({
                messages: state.messages.map(msg =>
                    msg.request_id === requestId && !msg.is_read
                        ? { ...msg, is_read: true, read_at: new Date().toISOString() }
                        : msg
                )
            }))
        } catch (_error) {
            set({ error: 'Failed to mark messages as read' })
        }
    },

    clearMessages: () => {
        set({ messages: [], currentRequestId: null })
    },

    refresh: async () => {
        const { currentRequestId } = get()
        if (currentRequestId) {
            await get().fetchMessages(currentRequestId)
        }
    },
}))
