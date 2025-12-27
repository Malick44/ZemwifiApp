import { create } from 'zustand'
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
    const { data, error } = await supabase.rpc('nearby_hotspots', {
      p_lat: lat,
      p_lng: lng,
      p_radius_m: 10000 // 10km default
    })

    if (error) {
      console.error('RPC Error:', error)
      set({ error: error.message, loading: false })
      return
    }

    if (data) {
      // Map RPC result to Hotspot type
      const mappedHotspots: Hotspot[] = data.map((item: any) => ({
        id: item.id,
        host_id: item.host_id,
        name: item.name,
        landmark: item.landmark,
        address: item.address,
        ssid: item.ssid,
        lat: item.lat,
        lng: item.lng,
        distance: item.distance_m, // Storing in meters to match UI expectation
        // Actually, the new UI uses item.distance in meters for display (toFixed(0) + ' m').
        // So let's store it in meters.
        is_online: item.online,
        status: item.online ? 'online' : 'offline',
        sales_paused: false, // Defaulting as RPC filters active, assuming safe
        hours: null // Missing from RPC, acceptable
      }))

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
    // relying on 'nearby_hotspots' RPC which returns online status based on Heartbeat.
    // We can just re-fetch the RPC here.
    const { userLocation } = get()
    if (userLocation) {
      await get().fetchNearbyHotspots(userLocation.lat, userLocation.lng)
    }
  },

  fetchPlansForHotspot: async (id) => {
    if (get().plans[id]) return
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('hotspot_id', id)
      .eq('is_active', true)
      .order('price_xof')
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
