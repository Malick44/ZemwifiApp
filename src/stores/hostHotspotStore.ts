import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { Hotspot, HotspotStats, Plan, PlanFormData, UUID } from '../types/domain'

// New Types for Dashboard
export interface ActiveSession {
    id: UUID
    device_name: string | null
    device_mac: string
    started_at: string
    expires_at: string
    data_usage_bytes: number
    plan_name: string
    hotspot_name: string
}

export interface SaleTransaction {
    id: UUID
    amount: number
    created_at: string
    status: 'pending' | 'success' | 'failed'
    plan_name: string
    hotspot_name: string
}

interface HostHotspotState {
    hotspots: Hotspot[]
    currentHotspot: Hotspot | null
    currentPlans: Plan[]

    currentStats: HotspotStats | null
    dashboardStats: {
        totalEarnings: number
        todayEarnings: number
        activeHotspots: number
        activeSessions: number
        totalSales: number
        pendingPayouts: number
    } | null
    activeSessions: ActiveSession[]
    recentSales: SaleTransaction[]
    loading: boolean
    error: string | null

    // Actions
    fetchHostHotspots: () => Promise<void>
    fetchActiveSessions: () => Promise<void>
    fetchDashboardStats: () => Promise<void>
    fetchHostSales: (period?: 'week' | 'month' | 'all') => Promise<void>
    fetchHotspotDetails: (id: UUID) => Promise<void>
    updateHotspotStatus: (id: UUID, isOnline: boolean) => Promise<void>
    updateHotspotRange: (id: UUID, range: number) => Promise<void>
    deleteHotspot: (id: UUID) => Promise<void>
    toggleSalesPause: (id: UUID) => Promise<void>

    // Plan Actions
    createPlan: (hotspotId: UUID, planData: PlanFormData) => Promise<void>
    updatePlan: (planId: UUID, planData: Partial<PlanFormData>) => Promise<void>
    togglePlanStatus: (planId: UUID, isActive: boolean) => Promise<void>
    deletePlan: (planId: UUID) => Promise<void>

    // Cash-In Actions
    createCashInRequest: (phone: string, amount: number) => Promise<{ id: string, expires_at: string }>
}

export const useHostHotspotStore = create<HostHotspotState>((set, get) => ({
    hotspots: [],
    currentHotspot: null,
    currentPlans: [],

    currentStats: null,
    dashboardStats: null,
    activeSessions: [],
    recentSales: [],
    loading: false,
    error: null,

    fetchHostHotspots: async () => {
        set({ loading: true, error: null })
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('hotspots')
                .select('*')
                .eq('host_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            const hotspotsData = data as Hotspot[]

            // Fetch active session counts for these hotspots
            if (hotspotsData.length > 0) {
                const hotspotIds = hotspotsData.map(h => h.id)

                // Get all active vouchers for these hotspots
                const { data: vouchers } = await supabase
                    .from('vouchers')
                    .select('hotspot_id')
                    .in('hotspot_id', hotspotIds)
                    .not('used_at', 'is', null)
                    .gt('expires_at', new Date().toISOString())

                // Count per hotspot
                const counts: Record<string, number> = {}
                vouchers?.forEach((v: any) => {
                    counts[v.hotspot_id] = (counts[v.hotspot_id] || 0) + 1
                })

                // Merge counts into hotspots
                const hotspotsWithCounts = hotspotsData.map(h => ({
                    ...h,
                    active_sessions_count: counts[h.id] || 0
                }))

                set({ hotspots: hotspotsWithCounts })
            } else {
                set({ hotspots: hotspotsData })
            }

        } catch (error: any) {
            console.error('Error fetching host hotspots:', error)
            set({ error: error.message })
        } finally {
            set({ loading: false })
        }
    },

    fetchActiveSessions: async () => {
        set({ loading: true, error: null })
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Get host's hotspots first
            const { data: hotspots } = await supabase
                .from('hotspots')
                .select('id, name')
                .eq('host_id', user.id)

            if (!hotspots || hotspots.length === 0) {
                set({ activeSessions: [] })
                return
            }
            const hotspotIds = hotspots.map(h => h.id)

            const { data, error } = await supabase
                .from('vouchers')
                .select(`
                    id,
                    device_mac,
                    used_at,
                    expires_at,
                    plan:plans(name),
                    hotspot:hotspots(name)
                `)
                .in('hotspot_id', hotspotIds)
                .not('used_at', 'is', null)
                .gt('expires_at', new Date().toISOString())
                .order('used_at', { ascending: false })

            if (error) throw error

            const sessions: ActiveSession[] = data.map((item: any) => ({
                id: item.id,
                device_name: 'Appareil inconnu', // We might not have this info stored yet
                device_mac: item.device_mac,
                started_at: item.used_at,
                expires_at: item.expires_at,
                data_usage_bytes: 0, // Placeholder, would need real tracking
                plan_name: item.plan?.name || 'Inconnu',
                hotspot_name: item.hotspot?.name || 'Inconnu'
            }))

            set({ activeSessions: sessions })
        } catch (error: any) {
            console.error('Error fetching active sessions:', error)
            set({ error: error.message })
        } finally {
            set({ loading: false })
        }
    },



    fetchDashboardStats: async () => {
        set({ loading: true, error: null })
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Fetch all stats in parallel for performance
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            // 1. Get Host's Hotspots (needed for filtering)
            const { data: hotspots } = await supabase
                .from('hotspots')
                .select('id, is_online')
                .eq('host_id', user.id)

            const hotspotIds = hotspots?.map(h => h.id) || []
            const activeHotspotsCount = hotspots?.filter(h => h.is_online).length || 0

            // 2. Active Sessions
            // We can't easily join and filter deep in one go without inner join, 
            // but we have hotspotIds so we can filter by that.
            let activeSessionsCount = 0
            if (hotspotIds.length > 0) {
                const { count } = await supabase
                    .from('vouchers')
                    .select('*', { count: 'exact', head: true })
                    .in('hotspot_id', hotspotIds)
                    .not('used_at', 'is', null)
                    .gt('expires_at', new Date().toISOString())
                activeSessionsCount = count || 0
            }

            // 3. Sales & Earnings
            let totalEarnings = 0
            let todayEarnings = 0
            let totalSales = 0

            if (hotspotIds.length > 0) {
                // Fetch small payload (just amounts and dates) to aggregate in memory
                // This is safer than RPC for now
                const { data: sales } = await supabase
                    .from('purchases')
                    .select('amount_xof, created_at, status')
                    .in('hotspot_id', hotspotIds)
                    .in('status', ['confirmed', 'success'])

                if (sales) {
                    totalSales = sales.length
                    for (const sale of sales) {
                        const amount = sale.amount_xof || 0
                        totalEarnings += amount
                        if (new Date(sale.created_at) >= today) {
                            todayEarnings += amount
                        }
                    }
                }
            }

            // 4. Pending Payouts
            const { data: payouts } = await supabase
                .from('payouts')
                .select('amount_xof')
                .eq('host_id', user.id)
                .eq('status', 'pending')

            const pendingPayouts = payouts?.reduce((sum, p) => sum + (p.amount_xof || 0), 0) || 0

            set({
                dashboardStats: {
                    totalEarnings,
                    todayEarnings,
                    activeHotspots: activeHotspotsCount,
                    activeSessions: activeSessionsCount,
                    totalSales,
                    pendingPayouts
                }
            })
        } catch (error: any) {
            console.error('Error fetching dashboard stats:', error)
            set({ error: error.message })
        } finally {
            set({ loading: false })
        }
    },

    fetchHostSales: async (period = 'week') => {
        set({ loading: true, error: null })
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data: hotspots } = await supabase
                .from('hotspots')
                .select('id')
                .eq('host_id', user.id)

            const hotspotIds = hotspots?.map(h => h.id) || []
            if (hotspotIds.length === 0) {
                set({ recentSales: [] })
                return
            }

            let query = supabase
                .from('purchases')
                .select(`
                     id,
                     amount_xof,
                     created_at,
                     status,
                     hotspot:hotspots(name)
                 `)
                .in('hotspot_id', hotspotIds)
                .order('created_at', { ascending: false })

            if (period === 'week') {
                const date = new Date()
                date.setDate(date.getDate() - 7)
                query = query.gte('created_at', date.toISOString())
            } else if (period === 'month') {
                const date = new Date()
                date.setDate(date.getDate() - 30)
                query = query.gte('created_at', date.toISOString())
            }

            const { data, error } = await query

            if (error) throw error

            const sales: SaleTransaction[] = data.map((item: any) => ({
                id: item.id,
                amount: item.amount_xof,
                created_at: item.created_at,
                status: item.status,
                plan_name: 'Forfait', // We might join plans if needed
                hotspot_name: item.hotspot?.name || 'Inconnu'
            }))

            set({ recentSales: sales })

        } catch (error: any) {
            console.error('Error fetching host sales:', error)
            set({ error: error.message })
        } finally {
            set({ loading: false })
        }
    },

    fetchHotspotDetails: async (id: UUID) => {
        set({ loading: true, error: null })
        try {
            // 1. Fetch Hotspot
            const { data: hotspot, error: hotspotError } = await supabase
                .from('hotspots')
                .select('*')
                .eq('id', id)
                .single()

            if (hotspotError) throw hotspotError

            // 2. Fetch Plans
            const { data: plans, error: plansError } = await supabase
                .from('plans')
                .select('*')
                .eq('hotspot_id', id)
                .order('price_xof', { ascending: true })

            if (plansError) throw plansError

            // 3. Calculate Stats (This would ideally be a backend function or robust queries)
            // For now we do some basic queries
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const { count: activeSessions } = await supabase
                .from('vouchers')
                .select('*', { count: 'exact', head: true })
                .eq('hotspot_id', id)
                .not('used_at', 'is', null)
                .gt('expires_at', new Date().toISOString())

            const { data: salesToday } = await supabase
                .from('purchases')
                .select('amount_xof')
                .eq('hotspot_id', id)
                .in('status', ['confirmed', 'success']) // Robust check
                .gte('created_at', today.toISOString())

            const { data: allSales } = await supabase
                .from('purchases')
                .select('amount_xof')
                .eq('hotspot_id', id)
                .in('status', ['confirmed', 'success'])

            const stats: HotspotStats = {
                active_sessions: activeSessions || 0,
                sales_today: salesToday?.reduce((sum, s) => sum + s.amount_xof, 0) || 0,
                sales_week: 0, // Placeholder, would need date math
                total_revenue: allSales?.reduce((sum, s) => sum + s.amount_xof, 0) || 0,
            }

            set({
                currentHotspot: hotspot as Hotspot,
                currentPlans: plans as Plan[],
                currentStats: stats
            })
        } catch (error: any) {
            console.error('Error fetching hotspot details:', error)
            set({ error: error.message })
        } finally {
            set({ loading: false })
        }
    },

    updateHotspotStatus: async (id: UUID, isOnline: boolean) => {
        try {
            const { error } = await supabase
                .from('hotspots')
                .update({ is_online: isOnline })
                .eq('id', id)

            if (error) throw error

            set(state => ({
                hotspots: state.hotspots.map(h => h.id === id ? { ...h, is_online: isOnline } : h),
                currentHotspot: state.currentHotspot?.id === id
                    ? { ...state.currentHotspot, is_online: isOnline }
                    : state.currentHotspot
            }))
        } catch (error: any) {
            console.error('Error updating hotspot status:', error)
            set({ error: error.message })
        }
    },

    updateHotspotRange: async (id: UUID, range: number) => {
        try {
            const { error } = await supabase
                .from('hotspots')
                .update({ range_meters: range })
                .eq('id', id)

            if (error) throw error

            set(state => ({
                hotspots: state.hotspots.map(h => h.id === id ? { ...h, range_meters: range } : h),
                currentHotspot: state.currentHotspot?.id === id
                    ? { ...state.currentHotspot, range_meters: range }
                    : state.currentHotspot
            }))
        } catch (error: any) {
            console.error('Error updating hotspot range:', error)
            set({ error: error.message })
        }
    },

    deleteHotspot: async (id: UUID) => {
        set({ loading: true })
        try {
            const { error } = await supabase
                .from('hotspots')
                .delete()
                .eq('id', id)

            if (error) throw error

            set(state => ({
                hotspots: state.hotspots.filter(h => h.id !== id),
                currentHotspot: state.currentHotspot?.id === id ? null : state.currentHotspot
            }))
        } catch (error: any) {
            console.error('Error deleting hotspot:', error)
            set({ error: error.message })
            throw error
        } finally {
            set({ loading: false })
        }
    },

    toggleSalesPause: async (id: UUID) => {
        try {
            const hotspot = get().currentHotspot
            if (!hotspot) return

            const newStatus = !hotspot.sales_paused

            const { error } = await supabase
                .from('hotspots')
                .update({ sales_paused: newStatus })
                .eq('id', id)

            if (error) throw error

            set(state => ({
                hotspots: state.hotspots.map(h => h.id === id ? { ...h, sales_paused: newStatus } : h),
                currentHotspot: state.currentHotspot?.id === id
                    ? { ...state.currentHotspot, sales_paused: newStatus }
                    : state.currentHotspot
            }))
        } catch (error: any) {
            console.error('Error toggling sales pause:', error)
            set({ error: error.message })
        }
    },

    createPlan: async (hotspotId: UUID, planData: PlanFormData) => {
        set({ loading: true })
        try {
            const { data, error } = await supabase
                .from('plans')
                .insert({
                    hotspot_id: hotspotId,
                    ...planData
                })
                .select()
                .single()

            if (error) throw error

            set(state => ({
                currentPlans: [...state.currentPlans, data as Plan]
            }))
        } catch (error: any) {
            console.error('Error creating plan:', error)
            set({ error: error.message })
            throw error
        } finally {
            set({ loading: false })
        }
    },

    updatePlan: async (planId: UUID, planData: Partial<PlanFormData>) => {
        set({ loading: true })
        try {
            const { data, error } = await supabase
                .from('plans')
                .update(planData)
                .eq('id', planId)
                .select()
                .single()

            if (error) throw error

            set(state => ({
                currentPlans: state.currentPlans.map(p => p.id === planId ? data as Plan : p)
            }))
        } catch (error: any) {
            console.error('Error updating plan:', error)
            set({ error: error.message })
            throw error
        } finally {
            set({ loading: false })
        }
    },

    togglePlanStatus: async (planId: UUID, isActive: boolean) => {
        try {
            const { error } = await supabase
                .from('plans')
                .update({ is_active: isActive })
                .eq('id', planId)

            if (error) throw error

            set(state => ({
                currentPlans: state.currentPlans.map(p => p.id === planId ? { ...p, is_active: isActive } : p)
            }))
        } catch (error: any) {
            console.error('Error toggling plan status:', error)
            set({ error: error.message })
        }
    },

    deletePlan: async (planId: UUID) => {
        set({ loading: true })
        try {
            const { error } = await supabase
                .from('plans')
                .delete()
                .eq('id', planId)

            if (error) throw error

            set(state => ({
                currentPlans: state.currentPlans.filter(p => p.id !== planId)
            }))
        } catch (error: any) {
            console.error('Error deleting plan:', error)
            set({ error: error.message })
            throw error
        } finally {
            set({ loading: false })
        }
    },

    createCashInRequest: async (phone: string, amount: number) => {
        set({ loading: true, error: null })
        try {
            const { data, error } = await supabase.rpc('host_create_cashin', {
                p_user_phone: phone,
                p_amount_xof: amount
            })

            if (error) throw error
            return data // { id, expires_at }
        } catch (error: any) {
            console.error('Error creating cashin:', error)
            set({ error: error.message })
            throw error
        } finally {
            set({ loading: false })
        }
    }
}))
