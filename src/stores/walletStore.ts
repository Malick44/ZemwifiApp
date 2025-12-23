import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { getErrorMessage } from '../lib/errors'
import { zustandStorage } from '../lib/storeStorage'
import type { Voucher } from '../types/domain'

type WalletState = {
  lastRefreshedAt: string | null
  isLoading: boolean
  error: string | null

  walletBalanceXof: number
  vouchers: Voucher[]

  refresh: (userId: string) => Promise<void>
  upsertVoucherLocal: (voucher: Voucher) => void
  setWalletBalanceLocal: (balanceXof: number) => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      lastRefreshedAt: null,
      isLoading: false,
      error: null,

      walletBalanceXof: 0,
      vouchers: [],

      setWalletBalanceLocal: (balanceXof) => set({ walletBalanceXof: balanceXof }),

      upsertVoucherLocal: (voucher) => {
        const existing = get().vouchers
        const idx = existing.findIndex((v) => v.id === voucher.id)
        const next = [...existing]
        if (idx >= 0) next[idx] = voucher
        else next.unshift(voucher)
        set({ vouchers: next })
      },

      refresh: async (userId) => {
        set({ isLoading: true, error: null })
        try {
          const [{ data: userRow, error: userError }, { data: vouchers, error: voucherError }] =
            await Promise.all([
              supabase.from('users').select('wallet_balance').eq('id', userId).single(),
              supabase
                .from('vouchers')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false }),
            ])

          if (userError) throw userError
          if (voucherError) throw voucherError

          set({
            walletBalanceXof: Number(userRow?.wallet_balance ?? 0),
            vouchers: (vouchers ?? []) as Voucher[],
            lastRefreshedAt: new Date().toISOString(),
            isLoading: false,
          })
        } catch (e) {
          set({ isLoading: false, error: getErrorMessage(e) })
        }
      },
    }),
    {
      name: 'zemwifi/wallet',
      version: 1,
      storage: zustandStorage,
      partialize: (state) => ({
        walletBalanceXof: state.walletBalanceXof,
        vouchers: state.vouchers,
        lastRefreshedAt: state.lastRefreshedAt,
      }) as WalletState,
    }
  )
)
