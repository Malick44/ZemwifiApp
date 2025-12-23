import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { getErrorMessage } from '../lib/errors'
import { zustandStorage } from '../lib/storeStorage'
import type { Hotspot, Plan } from '../types/domain'

type DiscoveryState = {
  lastRefreshedAt: string | null
  isLoading: boolean
  error: string | null

  hotspots: Hotspot[]
  plansByHotspotId: Record<string, Plan[]>

  refresh: () => Promise<void>
  getPlansForHotspot: (hotspotId: string) => Plan[]
}

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set, get) => ({
      lastRefreshedAt: null,
      isLoading: false,
      error: null,

      hotspots: [],
      plansByHotspotId: {},

      refresh: async () => {
        set({ isLoading: true, error: null })
        try {
          const { data: hotspots, error: hotspotsError } = await supabase
            .from('hotspots')
            .select('*')
            .eq('is_online', true)
            .order('created_at', { ascending: false })

          if (hotspotsError) throw hotspotsError

          const hotspotIds = (hotspots ?? []).map((h) => h.id)

          let plansByHotspotId: Record<string, Plan[]> = {}
          if (hotspotIds.length > 0) {
            const { data: plans, error: plansError } = await supabase
              .from('plans')
              .select('*')
              .eq('is_active', true)
              .in('hotspot_id', hotspotIds)

            if (plansError) throw plansError

            for (const p of plans ?? []) {
              if (!plansByHotspotId[p.hotspot_id]) plansByHotspotId[p.hotspot_id] = []
              plansByHotspotId[p.hotspot_id]!.push(p)
            }

            // Sort plans by price asc for consistent UI
            for (const id of Object.keys(plansByHotspotId)) {
              plansByHotspotId[id] = [...plansByHotspotId[id]].sort((a, b) => a.price_xof - b.price_xof)
            }
          }

          set({
            hotspots: (hotspots ?? []) as Hotspot[],
            plansByHotspotId,
            lastRefreshedAt: new Date().toISOString(),
            isLoading: false,
          })
        } catch (e) {
          set({ isLoading: false, error: getErrorMessage(e) })
        }
      },

      getPlansForHotspot: (hotspotId) => {
        return get().plansByHotspotId[hotspotId] ?? []
      },
    }),
    {
      name: 'zemwifi/discovery',
      version: 1,
      storage: zustandStorage,
      partialize: (state) => ({
        lastRefreshedAt: state.lastRefreshedAt,
        hotspots: state.hotspots,
        plansByHotspotId: state.plansByHotspotId,
      }) as DiscoveryState,
    }
  )
)
