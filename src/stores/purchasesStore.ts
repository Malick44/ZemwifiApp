import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { COLUMNS, ENUMS, RPC, TABLES } from '@/constants/db'
import { supabase } from '../lib/supabase'
import { Purchase, UUID } from '../types/domain'

export type PurchasesState = {
  purchases: Purchase[]
  loading: boolean
  error: string | null
  currentPurchase: Purchase | null
  startPurchase: (hotspotId: UUID, planId: UUID, provider: Purchase['provider']) => Promise<Purchase | null>
  refreshPurchases: () => Promise<void>
  updateStatus: (id: UUID, status: Purchase['status']) => Promise<void>
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
        const { data: purchaseId, error: rpcError } = await supabase.rpc(RPC.PROCESS_PURCHASE, {
          p_user_id: (await supabase.auth.getUser()).data.user?.id, // Get current user
          p_hotspot_id: hotspotId,
          p_plan_id: planId,
          p_payment_provider: provider // ensure RPC expects this or check definition
        })

        if (rpcError) {
          set({ error: rpcError.message, loading: false })
          return null
        }

        // Fetch the created purchase to update state
        const { data, error } = await supabase
          .from(TABLES.PURCHASES)
          .select('*')
          .eq(COLUMNS.PURCHASES.ID, purchaseId)
          .single()

        if (error) {
          set({ error: error.message, loading: false })
          return null
        }

        const purchaseData = {
          ...data,
          ...data,
          ...data,
          amount_xof: data.amount_xof ?? data.amount ?? 0, // Handle legacy/transition and ensure number
          provider: data.provider ?? 'wallet' // Default to wallet if missing
        }

        set((state) => ({
          purchases: [purchaseData as Purchase, ...state.purchases],
          currentPurchase: purchaseData as Purchase,
          loading: false
        }))

        return data
      },

      refreshPurchases: async () => {
        set({ loading: true, error: null })
        const { data, error } = await supabase
          .from(TABLES.PURCHASES)
          .select('*')
          .order(COLUMNS.PURCHASES.CREATED_AT, { ascending: false })
          .limit(50)

        if (error) {
          set({ error: error.message, loading: false })
          return
        }

        const mappedPurchases = (data ?? []).map((p: any) => ({
          ...p,
          amount_xof: p.amount_xof ?? p.amount ?? 0, // Handle legacy/transition and ensure number
          provider: p.provider ?? 'wallet' // Default to wallet if missing
        }))

        set({ purchases: mappedPurchases, loading: false })
      },

      updateStatus: async (id, status) => {
        const { error } = await supabase
          .from(TABLES.PURCHASES)
          .update({
            [COLUMNS.PURCHASES.PAYMENT_STATUS]: status,
            [COLUMNS.PURCHASES.UPDATED_AT]: new Date().toISOString()
          })
          .eq(COLUMNS.PURCHASES.ID, id)

        if (error) {
          set({ error: error.message })
          return
        }

        set((state) => ({
          purchases: state.purchases.map((p) =>
            p.id === id ? { ...p, status: status, updated_at: new Date().toISOString() } : p
          ),
          currentPurchase: state.currentPurchase?.id === id
            ? { ...state.currentPurchase, status: status }
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
        const status: Purchase['status'] = success
          ? ENUMS.PAYMENT_STATUS.SUCCESS
          : ENUMS.PAYMENT_STATUS.FAILED

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
