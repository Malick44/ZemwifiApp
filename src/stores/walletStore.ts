import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { COLUMNS, ENUMS, RPC, TABLES } from '@/constants/db'
import { supabase } from '../lib/supabase'
import { CashInRequest, UUID, Voucher } from '../types/domain'

export type WalletTransaction = {
  id: UUID
  user_id: UUID
  type: string
  amount: number
  balance_before: number
  balance_after: number
  reference_id: UUID | null
  reference_type: string | null
  description: string | null
  metadata: Record<string, unknown> | null
  created_at: string
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
            .from(TABLES.PROFILES)
            .select(COLUMNS.PROFILES.WALLET_BALANCE)
            .single()
          if (profileError) throw profileError
          if (profile) {
            set({ balance: profile[COLUMNS.PROFILES.WALLET_BALANCE] || 0 })
          }

          // 2. Get vouchers
          const { data: vouchers } = await supabase
            .from(TABLES.VOUCHERS)
            .select('*')
            .order(COLUMNS.VOUCHERS.CREATED_AT, { ascending: false })
          if (vouchers) set({ vouchers: vouchers as any })

          // 3. Get transactions
          const { data: transactions } = await supabase
            .from(TABLES.TRANSACTIONS)
            .select('*')
            .order(COLUMNS.TRANSACTIONS.CREATED_AT, { ascending: false })
            .limit(20)
          if (transactions) set({ transactions: transactions as WalletTransaction[] })

          // 4. Get pending cash-in requests
          const { data: cashins } = await supabase
            .from(TABLES.CASHIN_REQUESTS)
            .select('*')
            .eq(COLUMNS.CASHIN_REQUESTS.STATUS, ENUMS.CASHIN_STATUS.PENDING)
            .gt(COLUMNS.CASHIN_REQUESTS.EXPIRES_AT, new Date().toISOString())
            .order(COLUMNS.CASHIN_REQUESTS.CREATED_AT, { ascending: false })
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
          const { error } = await supabase.rpc(RPC.USER_CONFIRM_CASHIN, {
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
