import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { Purchase, UUID } from '../types/domain'

export type PurchasesState = {
  purchases: Purchase[]
  loading: boolean
  error: string | null
  startPurchase: (hotspotId: UUID, planId: UUID, provider: Purchase['payment_provider']) => Promise<Purchase | null>
  refreshPurchases: () => Promise<void>
  updateStatus: (id: UUID, status: Purchase['payment_status']) => void
}

export const usePurchasesStore = create<PurchasesState>((set) => ({
  purchases: [],
  loading: false,
  error: null,
  startPurchase: async (hotspotId, planId, provider) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('purchases')
      .insert({ hotspot_id: hotspotId, plan_id: planId, payment_provider: provider, amount: 0 })
      .select()
      .single()
    if (error) {
      set({ error: error.message, loading: false })
      return null
    }
    set((state) => ({ purchases: [data, ...state.purchases], loading: false }))
    return data
  },
  refreshPurchases: async () => {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      set({ error: error.message })
      return
    }
    set({ purchases: data ?? [] })
  },
  updateStatus: (id, status) => {
    set((state) => ({
      purchases: state.purchases.map((p) => (p.id === id ? { ...p, payment_status: status } : p)),
    }))
  },
}))
