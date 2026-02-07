import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { COLUMNS, TABLES } from '@/constants/db'
import { supabase } from '../lib/supabase'
import { Language, UUID } from '../types/domain'

type Profile = {
  id: UUID
  phone: string | null
  email: string | null
  name: string | null
  role?: 'guest' | 'user' | 'host' | 'technician' | 'admin'
  wallet_balance_xof?: number
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
  clearError: () => void
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
      clearError: () => set({ error: null }),
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
        set({ session: data.session })

        // Manually create profile if trigger failed (RLS workaround)
        if (data.user) {
          try {
            // Check if profile exists
            const { data: existingProfile } = await supabase
              .from(TABLES.PROFILES)
              .select('*')
              .eq(COLUMNS.PROFILES.ID, data.user.id)
              .single()

            if (!existingProfile) {
              // Get phone and email from auth user
              const userPhone = data.user.phone || data.user.user_metadata?.phone || phone
              const _userEmail = data.user.email || null

              // Create profile manually using service role or authenticated context
              await supabase.from(TABLES.PROFILES).insert({
                [COLUMNS.PROFILES.ID]: data.user.id,
                [COLUMNS.PROFILES.PHONE]: userPhone,
                [COLUMNS.PROFILES.NAME]: '',
                [COLUMNS.PROFILES.ROLE]: 'user'
              })
            }
          } catch (profileError) {
            // Ignore profile creation errors for now - user can update later
            console.warn('Profile creation warning:', profileError)
          }
        }

        set({ loading: false })
        await get().refreshSession()
      },
      refreshSession: async () => {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          set({ session: data.session })

          // Try to get profile, create if doesn't exist
          const { data: profileData, error: profileError } = await supabase
            .from(TABLES.PROFILES)
            .select('*')
            .eq(COLUMNS.PROFILES.ID, data.session.user.id)
            .single()

          if (profileData) {
            set({ profile: profileData })
          } else if (profileError?.code === 'PGRST116') {
            // Profile doesn't exist, create it
            try {
              // Get phone from user metadata or phone field
              const phone = data.session.user.phone || data.session.user.user_metadata?.phone || null
              const _email = data.session.user.email || null

              const { data: newProfile } = await supabase
                .from(TABLES.PROFILES)
                .insert({
                  [COLUMNS.PROFILES.ID]: data.session.user.id,
                  [COLUMNS.PROFILES.PHONE]: phone,
                  [COLUMNS.PROFILES.NAME]: '',
                  [COLUMNS.PROFILES.ROLE]: 'user'
                })
                .select()
                .single()

              if (newProfile) set({ profile: newProfile })
            } catch (err) {
              console.warn('Could not create profile:', err)
            }
          }
        }
      },
      updateProfile: async (input) => {
        const { data, error } = await supabase.from(TABLES.PROFILES).upsert(input).select().single()
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
