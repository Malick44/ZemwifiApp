import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { getErrorMessage } from '../lib/errors'
import { zustandStorage } from '../lib/storeStorage'
import type { CashInRequest } from '../types/domain'

type CashInState = {
  lastRefreshedAt: string | null
  isLoading: boolean
  error: string | null

  requests: CashInRequest[]

  refreshForUser: (userId: string) => Promise<void>
  refreshForHost: (hostId: string) => Promise<void>

  confirm: (requestId: string) => Promise<void>
  reject: (requestId: string, reason?: string) => Promise<void>

  // Helper for UI countdown
  getSecondsRemaining: (request: CashInRequest) => number
}

function secondsRemaining(expiresAtIso: string): number {
  const expires = new Date(expiresAtIso).getTime()
  const now = Date.now()
  const diffMs = expires - now
  return Math.max(0, Math.floor(diffMs / 1000))
}

export const useCashInStore = create<CashInState>()(
  persist(
    (set, get) => ({
      lastRefreshedAt: null,
      isLoading: false,
      error: null,

      requests: [],

      refreshForUser: async (userId) => {
        set({ isLoading: true, error: null })
        try {
          const { data, error } = await supabase
            .from('cashin_requests')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

          if (error) throw error

          set({
            requests: (data ?? []) as CashInRequest[],
            lastRefreshedAt: new Date().toISOString(),
            isLoading: false,
          })
        } catch (e) {
          set({ isLoading: false, error: getErrorMessage(e) })
        }
      },

      refreshForHost: async (hostId) => {
        set({ isLoading: true, error: null })
        try {
          const { data, error } = await supabase
            .from('cashin_requests')
            .select('*')
            .eq('host_id', hostId)
            .order('created_at', { ascending: false })

          if (error) throw error

          set({
            requests: (data ?? []) as CashInRequest[],
            lastRefreshedAt: new Date().toISOString(),
            isLoading: false,
          })
        } catch (e) {
          set({ isLoading: false, error: getErrorMessage(e) })
        }
      },

      confirm: async (requestId) => {
        set({ isLoading: true, error: null })
        try {
          const req = get().requests.find((r) => r.id === requestId)
          if (!req) throw new Error('Request not found')

          if (secondsRemaining(req.expires_at) <= 0) {
            throw new Error('This cash-in request has expired')
          }

          // Minimal client-side status update. In production, prefer an RPC that:
          // - checks expiry
          // - changes status
          // - updates wallet balance + transaction atomically
          const { error } = await supabase
            .from('cashin_requests')
            .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
            .eq('id', requestId)

          if (error) throw error

          set({
            requests: get().requests.map((r) =>
              r.id === requestId
                ? { ...r, status: 'confirmed', confirmed_at: new Date().toISOString() }
                : r
            ),
            isLoading: false,
          })
        } catch (e) {
          set({ isLoading: false, error: getErrorMessage(e) })
        }
      },

      reject: async (requestId, reason) => {
        set({ isLoading: true, error: null })
        try {
          const { error } = await supabase
            .from('cashin_requests')
            .update({
              status: 'rejected',
              rejected_at: new Date().toISOString(),
              rejection_reason: reason ?? null,
            })
            .eq('id', requestId)

          if (error) throw error

          set({
            requests: get().requests.map((r) =>
              r.id === requestId
                ? {
                    ...r,
                    status: 'rejected',
                    rejected_at: new Date().toISOString(),
                    rejection_reason: reason ?? null,
                  }
                : r
            ),
            isLoading: false,
          })
        } catch (e) {
          set({ isLoading: false, error: getErrorMessage(e) })
        }
      },

      getSecondsRemaining: (request) => secondsRemaining(request.expires_at),
    }),
    {
      name: 'zemwifi/cashin',
      version: 1,
      storage: zustandStorage,
      partialize: (state) => ({
        requests: state.requests,
        lastRefreshedAt: state.lastRefreshedAt,
      }) as CashInState,
    }
  )
)
