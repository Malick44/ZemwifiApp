import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { CashInRequest, UUID, Voucher } from '../types/domain'

export type WalletTransaction = {
  id: UUID
  type: 'cashin' | 'purchase' | 'adjustment'
  amount_xof: number
  created_at: string
  ref_type: string | null
}

export type WalletState = {
  balance: number
  vouchers: Voucher[]
  transactions: WalletTransaction[]
  pendingCashIns: CashInRequest[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  confirmCashIn: (requestId: UUID, decision: 'confirm' | 'deny') => Promise<void>
}

const storage = createJSONStorage(() => AsyncStorage)

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: 0,
      vouchers: [],
      transactions: [],
      pendingCashIns: [],
      loading: false,
      error: null,
      refresh: async () => {
        set({ loading: true, error: null })
        try {
          // 1. Get balance
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('wallet_balance_xof')
            .single()

          if (profile) set({ balance: profile.wallet_balance_xof || 0 })

          // 2. Get vouchers
          const { data: vouchers } = await supabase
            .from('vouchers')
            .select('*')
            .order('created_at', { ascending: false })

          if (vouchers) set({ vouchers: vouchers as any })

          // 3. Get transactions
          const { data: transactions } = await supabase
            .from('wallet_transactions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20)

          if (transactions) set({ transactions: transactions as any })

          // 4. Get pending cash-in requests
          const { data: cashins } = await supabase
            .from('cashin_requests')
            .select('*')
            .eq('status', 'pending')
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })

          if (cashins) set({ pendingCashIns: cashins as any })

        } catch (err: any) {
          console.error("Wallet refresh error", err)
          set({ error: err.message })
        } finally {
          set({ loading: false })
        }
      },

      confirmCashIn: async (requestId, decision) => {
        set({ loading: true, error: null })
        try {
          const { error } = await supabase.rpc('user_confirm_cashin', {
            p_request_id: requestId,
            p_decision: decision
          })
          if (error) throw error
          await get().refresh()
        } catch (err: any) {
          set({ error: err.message })
          throw err
        } finally {
          set({ loading: false })
        }
      }
    }),
    {
      name: 'zemwifi/wallet',
      version: 3,
      storage,
      partialize: (state) => ({
        balance: state.balance,
        vouchers: state.vouchers,
        transactions: state.transactions
      } as WalletState),
    }
  )
)
