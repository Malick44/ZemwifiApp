import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'

type AuthState = {
  language: 'fr' | 'en'
  setLanguage: (language: 'fr' | 'en') => void

  // Session/user are intentionally typed as unknown for now to avoid locking into a schema,
  // but store shape is in place so the app can evolve safely.
  session: unknown | null
  profile: unknown | null

  setGuest: () => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      language: 'fr',
      setLanguage: (language) => set({ language }),

      session: null,
      profile: null,

      setGuest: () => set({ session: null, profile: null }),

      signOut: async () => {
        await supabase.auth.signOut()
        set({ session: null, profile: null })
      },
    }),
    {
      name: 'zemwifi/auth',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ language: state.language } as AuthState),
    }
  )
)
