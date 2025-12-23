import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { Language, UUID } from '../types/domain'

type Profile = {
  id: UUID
  phone: string | null
  email: string | null
  full_name: string | null
}

type AuthState = {
  language: Language
  session: any | null
  profile: Profile | null
  loading: boolean
  error: string | null
  setLanguage: (language: Language) => void
  setGuest: () => void
  signOut: () => Promise<void>
  sendOtp: (phone: string) => Promise<void>
  verifyOtp: (phone: string, token: string) => Promise<void>
  refreshSession: () => Promise<void>
  updateProfile: (input: Partial<Profile>) => Promise<void>
}

const storage = createJSONStorage(() => AsyncStorage)

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      language: 'fr',
      session: null,
      profile: null,
      loading: false,
      error: null,
      setLanguage: (language) => set({ language }),
      setGuest: () => set({ session: null, profile: null }),
      signOut: async () => {
        await supabase.auth.signOut()
        set({ session: null, profile: null })
      },
      sendOtp: async (phone) => {
        set({ loading: true, error: null })
        const { error } = await supabase.auth.signInWithOtp({ phone })
        if (error) set({ error: error.message })
        set({ loading: false })
      },
      verifyOtp: async (phone, token) => {
        set({ loading: true, error: null })
        const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
        if (error) {
          set({ error: error.message, loading: false })
          return
        }
        set({ session: data.session, loading: false })
        await get().refreshSession()
      },
      refreshSession: async () => {
        const { data } = await supabase.auth.getSession()
        if (data.session) set({ session: data.session })
        const { data: profileData } = await supabase.from('profiles').select('*').single()
        if (profileData) set({ profile: profileData })
      },
      updateProfile: async (input) => {
        const { data, error } = await supabase.from('profiles').upsert(input).select().single()
        if (error) throw error
        set({ profile: data })
      },
    }),
    {
      name: 'zemwifi/auth',
      version: 2,
      storage,
      partialize: (state) => ({ language: state.language, profile: state.profile } as AuthState),
    }
  )
)
