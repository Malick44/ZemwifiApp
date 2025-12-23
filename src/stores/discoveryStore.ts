import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { Hotspot, Plan, UUID } from '../types/domain'

export type DiscoveryState = {
  hotspots: Hotspot[]
  plans: Record<UUID, Plan[]>
  loading: boolean
  error: string | null
  fetchHotspots: () => Promise<void>
  fetchPlansForHotspot: (id: UUID) => Promise<void>
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  hotspots: [],
  plans: {},
  loading: false,
  error: null,
  fetchHotspots: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase.from('hotspots').select('*').eq('is_online', true)
    if (error) set({ error: error.message })
    if (data) set({ hotspots: data })
    set({ loading: false })
  },
  fetchPlansForHotspot: async (id) => {
    if (get().plans[id]) return
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('hotspot_id', id)
      .eq('is_active', true)
    if (error) {
      set({ error: error.message })
      return
    }
    set((state) => ({ plans: { ...state.plans, [id]: data ?? [] } }))
  },
}))
