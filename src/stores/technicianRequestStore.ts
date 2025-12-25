import { create } from 'zustand'

export type RequestStatus = 'pending' | 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'
export type RequestPriority = 'low' | 'medium' | 'high'

export interface TechnicianRequest {
    id: string
    host_id: string
    hotspot_id: string
    technician_id?: string
    subject: string
    description: string
    priority: RequestPriority
    status: RequestStatus
    created_at: string
    updated_at: string
    assigned_at?: string
    accepted_at?: string
    completed_at?: string
    rejection_reason?: string
    completion_notes?: string
    photo_url?: string
    last_updated_by?: string
    update_count: number
    has_unread_messages: boolean

    // Relations (populated from other stores)
    host_name?: string
    hotspot_name?: string
    technician_name?: string
    technician_phone?: string
}

interface TechnicianRequestState {
    requests: TechnicianRequest[]
    loading: boolean
    error: string | null

    // Actions
    fetchRequests: () => Promise<void>
    fetchRequestById: (id: string) => Promise<TechnicianRequest | null>
    createRequest: (data: {
        hotspot_id: string
        subject: string
        description: string
        priority: RequestPriority
        photo_url?: string
    }) => Promise<TechnicianRequest>
    updateRequest: (id: string, data: {
        subject?: string
        description?: string
        priority?: RequestPriority
        photo_url?: string
    }) => Promise<void>
    updateRequestStatus: (id: string, status: RequestStatus) => Promise<void>
    assignTechnician: (requestId: string, technicianId: string) => Promise<void>
    acceptRequest: (requestId: string) => Promise<void>
    rejectRequest: (requestId: string, reason: string) => Promise<void>
    startRequest: (requestId: string) => Promise<void>
    completeRequest: (requestId: string, notes: string) => Promise<void>
    cancelRequest: (requestId: string, reason?: string) => Promise<void>
    refresh: () => Promise<void>
}

// Mock data generator
const generateMockRequests = (): TechnicianRequest[] => [
    {
        id: '1',
        host_id: 'host-1',
        hotspot_id: 'hotspot-1',
        technician_id: 'tech-1',
        subject: 'Routeur hors ligne',
        description: 'Le routeur ne s\'allume plus depuis la coupure de courant hier soir. J\'ai vérifié les câbles et tout semble correct.',
        priority: 'high',
        status: 'assigned',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        assigned_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        host_name: 'Ibrahim Kaboré',
        hotspot_name: 'Cyber Café Central',
        technician_name: 'Moussa Ouedraogo',
        technician_phone: '+226 70 00 00 00',
        update_count: 0,
        has_unread_messages: true,
    },
    {
        id: '2',
        host_id: 'host-1',
        hotspot_id: 'hotspot-2',
        technician_id: 'tech-1',
        subject: 'Problème de configuration',
        description: 'Les clients ne peuvent pas se connecter au Wi-Fi. Le signal est bon mais l\'authentification échoue.',
        priority: 'medium',
        status: 'in_progress',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        assigned_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        accepted_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        host_name: 'Ibrahim Kaboré',
        hotspot_name: 'Maibangué Wi-Fi',
        technician_name: 'Moussa Ouedraogo',
        technician_phone: '+226 70 00 00 00',
        update_count: 1,
        has_unread_messages: false,
    },
    {
        id: '3',
        host_id: 'host-1',
        hotspot_id: 'hotspot-3',
        technician_id: 'tech-2',
        subject: 'Installation antenne',
        description: 'Besoin d\'installer une nouvelle antenne pour améliorer la couverture dans la boutique.',
        priority: 'low',
        status: 'completed',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        assigned_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        accepted_at: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completion_notes: 'Antenne installée avec succès. Signal amélioré de 40%.',
        host_name: 'Ibrahim Kaboré',
        hotspot_name: 'Boutique Zogona',
        technician_name: 'Aminata Traoré',
        technician_phone: '+226 76 00 00 00',
        update_count: 0,
        has_unread_messages: false,
    },
]

export const useTechnicianRequestStore = create<TechnicianRequestState>((set, get) => ({
    requests: [],
    loading: false,
    error: null,

    fetchRequests: async () => {
        set({ loading: true, error: null })
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500))
            const mockRequests = generateMockRequests()
            set({ requests: mockRequests, loading: false })
        } catch (_error) {
            set({ error: 'Failed to fetch requests', loading: false })
        }
    },

    fetchRequestById: async (id: string) => {
        const { requests } = get()
        const request = requests.find(r => r.id === id)
        if (request) return request

        // If not in cache, fetch from API
        set({ loading: true })
        try {
            await new Promise(resolve => setTimeout(resolve, 300))
            const mockRequests = generateMockRequests()
            const found = mockRequests.find(r => r.id === id)
            if (found) {
                set({ requests: [...requests, found], loading: false })
                return found
            }
            set({ loading: false })
            return null
        } catch (_error) {
            set({ loading: false, error: 'Failed to fetch request' })
            return null
        }
    },

    createRequest: async (data) => {
        set({ loading: true, error: null })
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800))

            const newRequest: TechnicianRequest = {
                id: `req-${Date.now()}`,
                host_id: 'current-host-id', // Should come from auth store
                hotspot_id: data.hotspot_id,
                subject: data.subject,
                description: data.description,
                priority: data.priority,
                status: 'pending',
                update_count: 0,
                has_unread_messages: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                photo_url: data.photo_url,
                host_name: 'Current User', // Should come from auth store
            }

            set(state => ({
                requests: [newRequest, ...state.requests],
                loading: false
            }))

            // Auto-assign technician after creation
            setTimeout(() => {
                get().assignTechnician(newRequest.id, 'tech-1')
            }, 2000)

            return newRequest
        } catch (_error) {
            set({ error: 'Failed to create request', loading: false })
            throw _error
        }
    },

    updateRequest: async (id: string, data: {
        subject?: string
        description?: string
        priority?: RequestPriority
        photo_url?: string
    }) => {
        set({ loading: true, error: null })
        try {
            await new Promise(resolve => setTimeout(resolve, 400))

            set(state => ({
                requests: state.requests.map(req =>
                    req.id === id
                        ? {
                            ...req,
                            ...data,
                            update_count: req.update_count + 1,
                            last_updated_by: 'current-host-id',
                            updated_at: new Date().toISOString()
                        }
                        : req
                ),
                loading: false
            }))
        } catch (_error) {
            set({ error: 'Failed to update request', loading: false })
            throw _error
        }
    },

    updateRequestStatus: async (id: string, status: RequestStatus) => {
        set({ loading: true, error: null })
        try {
            await new Promise(resolve => setTimeout(resolve, 300))

            set(state => ({
                requests: state.requests.map(req =>
                    req.id === id
                        ? { ...req, status, updated_at: new Date().toISOString() }
                        : req
                ),
                loading: false
            }))
        } catch (_error) {
            set({ error: 'Failed to update status', loading: false })
        }
    },

    assignTechnician: async (requestId: string, technicianId: string) => {
        set({ loading: true, error: null })
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            set(state => ({
                requests: state.requests.map(req =>
                    req.id === requestId
                        ? {
                            ...req,
                            technician_id: technicianId,
                            status: 'assigned' as RequestStatus,
                            assigned_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            technician_name: 'Moussa Ouedraogo', // Should fetch from technician store
                            technician_phone: '+226 70 00 00 00',
                        }
                        : req
                ),
                loading: false
            }))
        } catch (_error) {
            set({ error: 'Failed to assign technician', loading: false })
        }
    },

    acceptRequest: async (requestId: string) => {
        set({ loading: true, error: null })
        try {
            await new Promise(resolve => setTimeout(resolve, 400))

            set(state => ({
                requests: state.requests.map(req =>
                    req.id === requestId
                        ? {
                            ...req,
                            status: 'accepted' as RequestStatus,
                            accepted_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        }
                        : req
                ),
                loading: false
            }))
        } catch (_error) {
            set({ error: 'Failed to accept request', loading: false })
        }
    },

    rejectRequest: async (requestId: string, reason: string) => {
        set({ loading: true, error: null })
        try {
            await new Promise(resolve => setTimeout(resolve, 400))

            set(state => ({
                requests: state.requests.map(req =>
                    req.id === requestId
                        ? {
                            ...req,
                            status: 'rejected' as RequestStatus,
                            rejection_reason: reason,
                            updated_at: new Date().toISOString(),
                            technician_id: undefined,
                            technician_name: undefined,
                            technician_phone: undefined,
                        }
                        : req
                ),
                loading: false
            }))

            // Auto-reassign to another technician after rejection
            setTimeout(() => {
                get().assignTechnician(requestId, 'tech-2')
            }, 3000)
        } catch (_error) {
            set({ error: 'Failed to reject request', loading: false })
        }
    },

    startRequest: async (requestId: string) => {
        set({ loading: true, error: null })
        try {
            await new Promise(resolve => setTimeout(resolve, 300))

            set(state => ({
                requests: state.requests.map(req =>
                    req.id === requestId
                        ? {
                            ...req,
                            status: 'in_progress' as RequestStatus,
                            updated_at: new Date().toISOString(),
                        }
                        : req
                ),
                loading: false
            }))
        } catch (_error) {
            set({ error: 'Failed to start request', loading: false })
        }
    },

    completeRequest: async (requestId: string, notes: string) => {
        set({ loading: true, error: null })
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            set(state => ({
                requests: state.requests.map(req =>
                    req.id === requestId
                        ? {
                            ...req,
                            status: 'completed' as RequestStatus,
                            completion_notes: notes,
                            completed_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        }
                        : req
                ),
                loading: false
            }))
        } catch (_error) {
            set({ error: 'Failed to complete request', loading: false })
        }
    },

    cancelRequest: async (requestId: string, reason?: string) => {
        set({ loading: true, error: null })
        try {
            await new Promise(resolve => setTimeout(resolve, 300))

            set(state => ({
                requests: state.requests.map(req =>
                    req.id === requestId
                        ? {
                            ...req,
                            status: 'cancelled' as RequestStatus,
                            cancellation_reason: reason,
                            updated_at: new Date().toISOString(),
                        }
                        : req
                ),
                loading: false
            }))
        } catch (_error) {
            set({ error: 'Failed to cancel request', loading: false })
        }
    },

    refresh: async () => {
        await get().fetchRequests()
    },
}))
