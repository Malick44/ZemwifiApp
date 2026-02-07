import { create } from 'zustand'
import { COLUMNS, ENUMS, RPC, TABLES } from '@/constants/db'
import { supabase } from '../lib/supabase'
import { CashInRequest, UUID } from '../types/domain'

export type CashInState = {
  requests: CashInRequest[]
  loading: boolean
  error: string | null
  createRequest: (hostId: UUID, amount: number, phone: string) => Promise<CashInRequest | null>
  confirmRequest: (id: UUID) => Promise<void>
  refresh: () => Promise<void>
}

export const useCashInStore = create<CashInState>((set) => ({
  requests: [],
  loading: false,
  error: null,
  createRequest: async (hostId, amount, phone) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from(TABLES.CASHIN_REQUESTS)
      .insert({
        [COLUMNS.CASHIN_REQUESTS.HOST_ID]: hostId,
        [COLUMNS.CASHIN_REQUESTS.AMOUNT]: amount,
        [COLUMNS.CASHIN_REQUESTS.USER_PHONE]: phone,
        [COLUMNS.CASHIN_REQUESTS.EXPIRES_AT]: new Date(Date.now() + 10 * 60000).toISOString()
      })
      .select()
      .single()
    if (error) {
      set({ error: error.message, loading: false })
      return null
    }
    set((state) => ({ requests: [data, ...state.requests], loading: false }))
    return data
  },
  confirmRequest: async (id) => {
    const { error } = await supabase.rpc(RPC.PROCESS_CASHIN, { p_cashin_request_id: id })
    if (error) throw error
    set((state) => ({
      requests: state.requests.map((r) => (
        r.id === id ? { ...r, status: ENUMS.CASHIN_STATUS.CONFIRMED } : r
      )),
    }))
  },
  refresh: async () => {
    const { data, error } = await supabase
      .from(TABLES.CASHIN_REQUESTS)
      .select('*')
      .order(COLUMNS.CASHIN_REQUESTS.CREATED_AT, { ascending: false })
    if (error) {
      set({ error: error.message })
      return
    }
    set({ requests: data ?? [] })
  },
}))
