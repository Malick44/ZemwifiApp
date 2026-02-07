import { create } from 'zustand'
import { COLUMNS, TABLES } from '@/constants/db'
import { supabase } from '../lib/supabase'

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

    // Relations (populated from joins)
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

const COL = COLUMNS.TECHNICIAN_REQUESTS

export const useTechnicianRequestStore = create<TechnicianRequestState>((set, get) => ({
    requests: [],
    loading: false,
    error: null,

    fetchRequests: async () => {
        set({ loading: true, error: null })
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Get user's role to determine which requests to fetch
            const { data: profile } = await supabase
                .from(TABLES.PROFILES)
                .select('role')
                .eq('id', user.id)
                .single()

            let query = supabase
                .from(TABLES.TECHNICIAN_REQUESTS)
                .select(`
                    *,
                    host:profiles!technician_requests_host_id_fkey(full_name, phone),
                    hotspot:hotspots!technician_requests_hotspot_id_fkey(name),
                    technician:profiles!technician_requests_technician_id_fkey(full_name, phone)
                `)
                .order(COL.CREATED_AT, { ascending: false })

            // Filter based on role
            if (profile?.role === 'technician') {
                query = query.eq(COL.TECHNICIAN_ID, user.id)
            } else if (profile?.role === 'host') {
                query = query.eq(COL.HOST_ID, user.id)
            }
            // Admins see all requests

            const { data, error } = await query

            if (error) throw error

            // Transform data to match interface
            const requests: TechnicianRequest[] = (data || []).map((row: any) => ({
                id: row.id,
                host_id: row.host_id,
                hotspot_id: row.hotspot_id,
                technician_id: row.technician_id,
                subject: row.subject,
                description: row.description,
                priority: row.priority as RequestPriority,
                status: row.status as RequestStatus,
                created_at: row.created_at,
                updated_at: row.updated_at,
                assigned_at: row.assigned_at,
                accepted_at: row.accepted_at,
                completed_at: row.completed_at,
                rejection_reason: row.rejection_reason,
                completion_notes: row.completion_notes,
                photo_url: row.photo_url,
                host_name: row.host?.full_name,
                hotspot_name: row.hotspot?.name,
                technician_name: row.technician?.full_name,
                technician_phone: row.technician?.phone,
            }))

            set({ requests, loading: false })
        } catch (err: unknown) {
            const error = err as Error
            console.error('Failed to fetch requests:', error)
            set({ error: error.message || 'Failed to fetch requests', loading: false })
        }
    },

    fetchRequestById: async (id: string) => {
        const { requests } = get()
        const cached = requests.find(r => r.id === id)
        if (cached) return cached

        set({ loading: true })
        try {
            const { data, error } = await supabase
                .from(TABLES.TECHNICIAN_REQUESTS)
                .select(`
                    *,
                    host:profiles!technician_requests_host_id_fkey(full_name, phone),
                    hotspot:hotspots!technician_requests_hotspot_id_fkey(name),
                    technician:profiles!technician_requests_technician_id_fkey(full_name, phone)
                `)
                .eq(COL.ID, id)
                .single()

            if (error) throw error
            if (!data) return null

            const request: TechnicianRequest = {
                id: data.id,
                host_id: data.host_id,
                hotspot_id: data.hotspot_id,
                technician_id: data.technician_id,
                subject: data.subject,
                description: data.description,
                priority: data.priority as RequestPriority,
                status: data.status as RequestStatus,
                created_at: data.created_at,
                updated_at: data.updated_at,
                assigned_at: data.assigned_at,
                accepted_at: data.accepted_at,
                completed_at: data.completed_at,
                rejection_reason: data.rejection_reason,
                completion_notes: data.completion_notes,
                photo_url: data.photo_url,
                host_name: (data as any).host?.full_name,
                hotspot_name: (data as any).hotspot?.name,
                technician_name: (data as any).technician?.full_name,
                technician_phone: (data as any).technician?.phone,
            }

            set(state => ({
                requests: [...state.requests.filter(r => r.id !== id), request],
                loading: false
            }))

            return request
        } catch (err: unknown) {
            const error = err as Error
            console.error('Failed to fetch request:', error)
            set({ loading: false, error: error.message || 'Failed to fetch request' })
            return null
        }
    },

    createRequest: async (data) => {
        set({ loading: true, error: null })
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data: newRequest, error } = await supabase
                .from(TABLES.TECHNICIAN_REQUESTS)
                .insert({
                    [COL.HOST_ID]: user.id,
                    [COL.HOTSPOT_ID]: data.hotspot_id,
                    [COL.SUBJECT]: data.subject,
                    [COL.DESCRIPTION]: data.description,
                    [COL.PRIORITY]: data.priority,
                    [COL.STATUS]: 'pending',
                    [COL.PHOTO_URL]: data.photo_url,
                })
                .select()
                .single()

            if (error) throw error

            const request: TechnicianRequest = {
                id: newRequest.id,
                host_id: newRequest.host_id,
                hotspot_id: newRequest.hotspot_id,
                subject: newRequest.subject,
                description: newRequest.description,
                priority: newRequest.priority as RequestPriority,
                status: newRequest.status as RequestStatus,
                created_at: newRequest.created_at,
                updated_at: newRequest.updated_at,
                photo_url: newRequest.photo_url,
            }

            set(state => ({
                requests: [request, ...state.requests],
                loading: false
            }))

            return request
        } catch (err: unknown) {
            const error = err as Error
            console.error('Failed to create request:', error)
            set({ error: error.message || 'Failed to create request', loading: false })
            throw err
        }
    },

    updateRequest: async (id: string, data) => {
        set({ loading: true, error: null })
        try {
            const updateData: Record<string, unknown> = {}
            if (data.subject !== undefined) updateData[COL.SUBJECT] = data.subject
            if (data.description !== undefined) updateData[COL.DESCRIPTION] = data.description
            if (data.priority !== undefined) updateData[COL.PRIORITY] = data.priority
            if (data.photo_url !== undefined) updateData[COL.PHOTO_URL] = data.photo_url

            const { error } = await supabase
                .from(TABLES.TECHNICIAN_REQUESTS)
                .update(updateData)
                .eq(COL.ID, id)

            if (error) throw error

            set(state => ({
                requests: state.requests.map(req =>
                    req.id === id
                        ? { ...req, ...data, updated_at: new Date().toISOString() }
                        : req
                ),
                loading: false
            }))
        } catch (err: unknown) {
            const error = err as Error
            console.error('Failed to update request:', error)
            set({ error: error.message || 'Failed to update request', loading: false })
            throw err
        }
    },

    updateRequestStatus: async (id: string, status: RequestStatus) => {
        set({ loading: true, error: null })
        try {
            const { error } = await supabase
                .from(TABLES.TECHNICIAN_REQUESTS)
                .update({ [COL.STATUS]: status })
                .eq(COL.ID, id)

            if (error) throw error

            set(state => ({
                requests: state.requests.map(req =>
                    req.id === id
                        ? { ...req, status, updated_at: new Date().toISOString() }
                        : req
                ),
                loading: false
            }))
        } catch (err: unknown) {
            const error = err as Error
            console.error('Failed to update status:', error)
            set({ error: error.message || 'Failed to update status', loading: false })
        }
    },

    assignTechnician: async (requestId: string, technicianId: string) => {
        set({ loading: true, error: null })
        try {
            const { error } = await supabase
                .from(TABLES.TECHNICIAN_REQUESTS)
                .update({
                    [COL.TECHNICIAN_ID]: technicianId,
                    [COL.STATUS]: 'assigned',
                    [COL.ASSIGNED_AT]: new Date().toISOString(),
                })
                .eq(COL.ID, requestId)

            if (error) throw error

            // Fetch technician details
            const { data: technician } = await supabase
                .from(TABLES.PROFILES)
                .select('full_name, phone')
                .eq('id', technicianId)
                .single()

            set(state => ({
                requests: state.requests.map(req =>
                    req.id === requestId
                        ? {
                            ...req,
                            technician_id: technicianId,
                            status: 'assigned' as RequestStatus,
                            assigned_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            technician_name: technician?.full_name,
                            technician_phone: technician?.phone,
                        }
                        : req
                ),
                loading: false
            }))
        } catch (err: unknown) {
            const error = err as Error
            console.error('Failed to assign technician:', error)
            set({ error: error.message || 'Failed to assign technician', loading: false })
        }
    },

    acceptRequest: async (requestId: string) => {
        set({ loading: true, error: null })
        try {
            const { error } = await supabase
                .from(TABLES.TECHNICIAN_REQUESTS)
                .update({
                    [COL.STATUS]: 'accepted',
                    [COL.ACCEPTED_AT]: new Date().toISOString(),
                })
                .eq(COL.ID, requestId)

            if (error) throw error

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
        } catch (err: unknown) {
            const error = err as Error
            console.error('Failed to accept request:', error)
            set({ error: error.message || 'Failed to accept request', loading: false })
        }
    },

    rejectRequest: async (requestId: string, reason: string) => {
        set({ loading: true, error: null })
        try {
            const { error } = await supabase
                .from(TABLES.TECHNICIAN_REQUESTS)
                .update({
                    [COL.STATUS]: 'rejected',
                    [COL.REJECTION_REASON]: reason,
                    [COL.TECHNICIAN_ID]: null,
                })
                .eq(COL.ID, requestId)

            if (error) throw error

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
        } catch (err: unknown) {
            const error = err as Error
            console.error('Failed to reject request:', error)
            set({ error: error.message || 'Failed to reject request', loading: false })
        }
    },

    startRequest: async (requestId: string) => {
        set({ loading: true, error: null })
        try {
            const { error } = await supabase
                .from(TABLES.TECHNICIAN_REQUESTS)
                .update({
                    [COL.STATUS]: 'in_progress',
                })
                .eq(COL.ID, requestId)

            if (error) throw error

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
        } catch (err: unknown) {
            const error = err as Error
            console.error('Failed to start request:', error)
            set({ error: error.message || 'Failed to start request', loading: false })
        }
    },

    completeRequest: async (requestId: string, notes: string) => {
        set({ loading: true, error: null })
        try {
            const { error } = await supabase
                .from(TABLES.TECHNICIAN_REQUESTS)
                .update({
                    [COL.STATUS]: 'completed',
                    [COL.COMPLETION_NOTES]: notes,
                    [COL.COMPLETED_AT]: new Date().toISOString(),
                })
                .eq(COL.ID, requestId)

            if (error) throw error

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
        } catch (err: unknown) {
            const error = err as Error
            console.error('Failed to complete request:', error)
            set({ error: error.message || 'Failed to complete request', loading: false })
        }
    },

    cancelRequest: async (requestId: string, _reason?: string) => {
        set({ loading: true, error: null })
        try {
            const { error } = await supabase
                .from(TABLES.TECHNICIAN_REQUESTS)
                .update({
                    [COL.STATUS]: 'cancelled',
                })
                .eq(COL.ID, requestId)

            if (error) throw error

            set(state => ({
                requests: state.requests.map(req =>
                    req.id === requestId
                        ? {
                            ...req,
                            status: 'cancelled' as RequestStatus,
                            updated_at: new Date().toISOString(),
                        }
                        : req
                ),
                loading: false
            }))
        } catch (err: unknown) {
            const error = err as Error
            console.error('Failed to cancel request:', error)
            set({ error: error.message || 'Failed to cancel request', loading: false })
        }
    },

    refresh: async () => {
        await get().fetchRequests()
    },
}))
