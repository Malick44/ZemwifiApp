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
  fetchPlansForHotspot: (id: UUID) => Promise<void>
  setSearchQuery: (query: string) => void
  setUserLocation: (location: { lat: number; lng: number } | null) => void
  getFilteredHotspots: () => Hotspot[]
  getNearbyHotspots: (maxDistance?: number) => Hotspot[]
}

// Calculate distance between two points using Haversine formula (in km)
const calculateDistance = (
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
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('hotspots')
      .select('*')
      .eq('is_online', true)
      .eq('sales_paused', false)
      .order('name')
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
  
  getNearbyHotspots: (maxDistance = 5) => {
    const { hotspots, userLocation } = get()
    if (!userLocation) return hotspots
    return hotspots
      .map((h) => ({
        ...h,
        distance: calculateDistance(userLocation.lat, userLocation.lng, h.lat, h.lng),
      }))
      .filter((h) => h.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
  },
}))
