import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { Voucher, UUID } from '../types/domain'

export type WalletState = {
  balance: number
  vouchers: Voucher[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  redeemVoucher: (code: string) => Promise<void>
  createVoucher: (planId: UUID, hotspotId: UUID) => Promise<Voucher | null>
}

const storage = createJSONStorage(() => AsyncStorage)

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      balance: 0,
      vouchers: [],
      loading: false,
      error: null,
      refresh: async () => {
        set({ loading: true, error: null })
        const { data: wallet } = await supabase.from('wallets').select('balance').single()
        if (wallet) set({ balance: wallet.balance })
        const { data: vouchers, error } = await supabase
          .from('vouchers')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) set({ error: error.message })
        if (vouchers) set({ vouchers })
        set({ loading: false })
      },
      redeemVoucher: async (code) => {
        const { error } = await supabase.rpc('redeem_voucher', { voucher_code: code })
        if (error) throw error
        await useWalletStore.getState().refresh()
      },
      createVoucher: async (planId, hotspotId) => {
        const { data, error } = await supabase
          .from('vouchers')
          .insert({ plan_id: planId, hotspot_id: hotspotId })
          .select()
          .single()
        if (error) {
          set({ error: error.message })
          return null
        }
        set((state) => ({ vouchers: [data, ...state.vouchers] }))
        return data
      },
    }),
    {
      name: 'zemwifi/wallet',
      version: 1,
      storage,
      partialize: (state) => ({ balance: state.balance, vouchers: state.vouchers } as WalletState),
    }
  )
)
