import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { CashInRequest, UUID } from '../types/domain'
import { isoNow } from '../lib/time'

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
      .from('cash_in_requests')
      .insert({ host_id: hostId, amount, user_phone: phone, expires_at: isoNow() })
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
    const { error } = await supabase.rpc('confirm_cash_in', { request_id: id })
    if (error) throw error
    set((state) => ({
      requests: state.requests.map((r) => (r.id === id ? { ...r, status: 'confirmed' } : r)),
    }))
  },
  refresh: async () => {
    const { data, error } = await supabase
      .from('cash_in_requests')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      set({ error: error.message })
      return
    }
    set({ requests: data ?? [] })
  },
}))
