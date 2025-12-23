import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { getErrorMessage } from '../lib/errors'
import { zustandStorage } from '../lib/storeStorage'
import type { Purchase } from '../types/domain'

type PurchasesState = {
  lastRefreshedAt: string | null
  isLoading: boolean
  error: string | null

  purchases: Purchase[]

  refresh: (userId: string) => Promise<void>
}

export const usePurchasesStore = create<PurchasesState>()(
  persist(
    (set) => ({
      lastRefreshedAt: null,
      isLoading: false,
      error: null,

      purchases: [],

      refresh: async (userId) => {
        set({ isLoading: true, error: null })
        try {
          const { data, error } = await supabase
            .from('purchases')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

          if (error) throw error

          set({
            purchases: (data ?? []) as Purchase[],
            lastRefreshedAt: new Date().toISOString(),
            isLoading: false,
          })
        } catch (e) {
          set({ isLoading: false, error: getErrorMessage(e) })
        }
      },
    }),
    {
      name: 'zemwifi/purchases',
      version: 1,
      storage: zustandStorage,
      partialize: (state) => ({
        purchases: state.purchases,
        lastRefreshedAt: state.lastRefreshedAt,
      }) as PurchasesState,
    }
  )
)
