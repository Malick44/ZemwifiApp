import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { Language, UUID } from '../types/domain'

type Profile = {
  id: UUID
  phone: string | null
  email: string | null
  full_name: string | null
  role?: 'guest' | 'user' | 'host' | 'technician' | 'admin'
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
        set({ session: data.session })
        
        // Manually create profile if trigger failed (RLS workaround)
        if (data.user) {
          try {
            // Check if profile exists
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single()
            
            if (!existingProfile) {
              // Create profile manually using service role or authenticated context
              await supabase.from('profiles').insert({
                id: data.user.id,
                phone: phone,
                full_name: '',
                role: 'user'
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
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()
          
          if (profileData) {
            set({ profile: profileData })
          } else if (profileError?.code === 'PGRST116') {
            // Profile doesn't exist, create it
            try {
              const { data: newProfile } = await supabase
                .from('profiles')
                .insert({
                  id: data.session.user.id,
                  phone: data.session.user.phone || null,
                  full_name: '',
                  role: 'user'
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
