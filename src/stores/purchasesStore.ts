import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { Purchase, UUID } from '../types/domain'

export type PurchasesState = {
  purchases: Purchase[]
  loading: boolean
  error: string | null
  currentPurchase: Purchase | null
  startPurchase: (hotspotId: UUID, planId: UUID, provider: Purchase['payment_provider']) => Promise<Purchase | null>
  refreshPurchases: () => Promise<void>
  updateStatus: (id: UUID, status: Purchase['payment_status']) => Promise<void>
  simulatePayment: (purchaseId: UUID) => Promise<void>
  setCurrentPurchase: (purchase: Purchase | null) => void
}

const storage = createJSONStorage(() => AsyncStorage)

export const usePurchasesStore = create<PurchasesState>()(
  persist(
    (set, get) => ({
      purchases: [],
      loading: false,
      error: null,
      currentPurchase: null,

      startPurchase: async (hotspotId, planId, provider) => {
        set({ loading: true, error: null })

        // Use RPC to process purchase (handles wallet deduction, voucher creation, etc.)
        const { data: purchaseId, error: rpcError } = await supabase.rpc('process_purchase', {
          p_user_id: (await supabase.auth.getUser()).data.user?.id, // Get current user
          p_hotspot_id: hotspotId,
          p_plan_id: planId,
          p_payment_provider: provider
        })

        if (rpcError) {
          set({ error: rpcError.message, loading: false })
          return null
        }

        // Fetch the created purchase to update state
        const { data, error } = await supabase
          .from('purchases')
          .select('*')
          .eq('id', purchaseId)
          .single()

        if (error) {
          set({ error: error.message, loading: false })
          return null
        }

        set((state) => ({
          purchases: [data, ...state.purchases],
          currentPurchase: data,
          loading: false
        }))

        return data
      },

      refreshPurchases: async () => {
        set({ loading: true, error: null })
        const { data, error } = await supabase
          .from('purchases')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) {
          set({ error: error.message, loading: false })
          return
        }

        set({ purchases: data ?? [], loading: false })
      },

      updateStatus: async (id, status) => {
        const { error } = await supabase
          .from('purchases')
          .update({ payment_status: status, updated_at: new Date().toISOString() })
          .eq('id', id)

        if (error) {
          set({ error: error.message })
          return
        }

        set((state) => ({
          purchases: state.purchases.map((p) =>
            p.id === id ? { ...p, payment_status: status, updated_at: new Date().toISOString() } : p
          ),
          currentPurchase: state.currentPurchase?.id === id
            ? { ...state.currentPurchase, payment_status: status }
            : state.currentPurchase
        }))
      },

      // Mock payment simulation for development/testing
      simulatePayment: async (purchaseId) => {
        set({ loading: true })

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        // 90% success rate for simulation
        const success = Math.random() > 0.1
        const status: Purchase['payment_status'] = success ? 'success' : 'failed'

        await get().updateStatus(purchaseId, status)
        set({ loading: false })
      },

      setCurrentPurchase: (purchase) => set({ currentPurchase: purchase }),
    }),
    {
      name: 'zemwifi/purchases',
      version: 1,
      storage,
      partialize: (state) => ({
        purchases: state.purchases.slice(0, 20) // Only persist recent 20 purchases
      } as Partial<PurchasesState>),
    }
  )
)
