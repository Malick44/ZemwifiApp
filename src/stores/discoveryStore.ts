import { create } from 'zustand'
import { COLUMNS, ENUMS, RPC, TABLES } from '@/constants/db'
import { supabase } from '../lib/supabase'
import { Hotspot, Plan, UUID } from '../types/domain'

export type DiscoveryState = {
  hotspots: Hotspot[]
  plans: Record<UUID, Plan[]>
  loading: boolean
  error: string | null
  searchQuery: string
  userLocation: { lat: number; lng: number } | null
  fetchHotspots: () => Promise<void>
  fetchNearbyHotspots: (lat: number, lng: number) => Promise<void>
  scanWifi: () => Promise<void>
  fetchPlansForHotspot: (id: UUID) => Promise<void>
  setSearchQuery: (query: string) => void
  setUserLocation: (location: { lat: number; lng: number } | null) => void
  getFilteredHotspots: () => Hotspot[]
  getNearbyHotspots: (maxDistance?: number) => Hotspot[]
}

// Calculate distance between two points using Haversine formula (in km)
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  hotspots: [],
  plans: {},
  loading: false,
  error: null,
  searchQuery: '',
  userLocation: null,

  fetchHotspots: async () => {
    // Deprecated in favor of fetchNearbyHotspots, keeping empty or redirecting if needed
    // For now, we will leave it as a no-op or alias to avoid breaking calls if any
  },

  fetchNearbyHotspots: async (lat: number, lng: number) => {
    set({ loading: true, error: null })

    // Call the RPC
    const radiusM = 10000
    let { data, error } = await supabase.rpc(RPC.NEARBY_HOTSPOTS, {
      p_lat: lat,
      p_lng: lng,
      p_radius_m: radiusM // 10km default
    })
    if (error?.code === 'PGRST202') {
      const fallback = await supabase.rpc(RPC.NEARBY_HOTSPOTS, {
        p_lat: lat,
        p_lng: lng,
        radius_m: radiusM
      })
      data = fallback.data
      error = fallback.error
    }
    if (error?.code === 'PGRST202') {
      const legacy = await supabase.rpc(RPC.NEARBY_HOTSPOTS, {
        lat,
        lng,
        radius_m: radiusM
      })
      data = legacy.data
      error = legacy.error
    }

    if (error) {
      console.error('RPC Error:', error)
      set({ error: error.message, loading: false })
      return
    }

    if (data) {
      // Map RPC result to Hotspot type
      const mappedHotspots: Hotspot[] = data.map((item: any) => {
        const isOnline = item.online ?? item.is_online ?? false
        return {
          id: item.id ?? item.hotspot_id,
          host_id: item.host_id ?? '',
          name: item.name ?? 'Hotspot',
          landmark: item.landmark ?? '',
          address: item.address ?? null,
          ssid: item.ssid ?? null,
          lat: item.lat ?? item.latitude ?? null,
          lng: item.lng ?? item.longitude ?? null,
          distance: item.distance_m, // Storing in meters to match UI expectation
          // Actually, the new UI uses item.distance in meters for display (toFixed(0) + ' m').
          // So let's store it in meters.
          is_online: isOnline,
          status: isOnline ? ENUMS.HOTSPOT_STATUS.ONLINE : ENUMS.HOTSPOT_STATUS.OFFLINE,
          sales_paused: item.sales_paused ?? false,
          created_at: item.created_at ?? new Date().toISOString(),
          hours: null // Missing from RPC, acceptable
        }
      })

      // Deduplicate by ID just in case
      const uniqueHotspots = Array.from(new Map(mappedHotspots.map(item => [item.id, item])).values());
      set({ hotspots: uniqueHotspots })
      // Trigger scan to update status purely based on local detection (optional "double check")
      // Scan trigged removed to prevent infinite loop with fetchNearbyHotspots
    }
    set({ loading: false })
  },

  scanWifi: async () => {
    // Native WiFi scanning on iOS/Android is restricted and unreliable.
    // Rely on the nearby_hotspots RPC which returns online status based on heartbeat.
    const { userLocation } = get()
    if (userLocation) {
      await get().fetchNearbyHotspots(userLocation.lat, userLocation.lng)
    }
  },

  fetchPlansForHotspot: async (id) => {
    if (get().plans[id]) return
    const { data, error } = await supabase
      .from(TABLES.PLANS)
      .select('*')
      .eq(COLUMNS.PLANS.HOTSPOT_ID, id)
      .eq(COLUMNS.PLANS.IS_ACTIVE, true)
      .order(COLUMNS.PLANS.PRICE_XOF)
    if (error) {
      set({ error: error.message })
      return
    }
    set((state) => ({ plans: { ...state.plans, [id]: data ?? [] } }))
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setUserLocation: (location) => set({ userLocation: location }),

  getFilteredHotspots: () => {
    // Client-side filtering only for Search Query now
    const { hotspots, searchQuery } = get()
    if (!searchQuery.trim()) return hotspots
    const query = searchQuery.toLowerCase()
    return hotspots.filter(
      (h) =>
        h.name.toLowerCase().includes(query) ||
        h.landmark.toLowerCase().includes(query) ||
        h.address?.toLowerCase().includes(query)
    )
  },

  getNearbyHotspots: (maxDistance = 10000) => {
    // Now just returns the hotspots since they are ALREADY fetched by distance via RPC
    return get().hotspots
  },
}))
