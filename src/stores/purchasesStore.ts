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
        
        // Fetch plan details to get price
        const { data: plan } = await supabase.from('plans').select('price_xof').eq('id', planId).single()
        const amount = plan?.price_xof ?? 0
        
        const { data, error } = await supabase
          .from('purchases')
          .insert({ 
            hotspot_id: hotspotId, 
            plan_id: planId, 
            payment_provider: provider, 
            amount,
            payment_status: 'pending'
          })
          .select()
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
