import { useAuthStore } from '../stores/authStore'

type Messages = Record<string, { en: string; fr: string }>

const messages: Messages = {
  welcome_title: { en: 'Welcome to ZemNet', fr: 'Bienvenue sur ZemNet' },
  continue: { en: 'Continue', fr: 'Continuer' },
  back: { en: 'Back', fr: 'Retour' },
  phone_label: { en: 'Phone number', fr: 'Numéro de téléphone' },
  otp_label: { en: 'Enter code', fr: 'Entrez le code' },
  profile_title: { en: 'Your profile', fr: 'Votre profil' },
  map_tab: { en: 'Map', fr: 'Carte' },
  list_tab: { en: 'List', fr: 'Liste' },
  wallet_tab: { en: 'Wallet', fr: 'Portefeuille' },
  host_tab: { en: 'Host', fr: 'Hôte' },
  settings_tab: { en: 'Settings', fr: 'Réglages' },
  loading: { en: 'Loading...', fr: 'Chargement...' },
  error_generic: { en: 'Something went wrong', fr: 'Une erreur est survenue' },
}

export const t = (key: keyof typeof messages, language?: 'en' | 'fr'): string => {
  const lang = language ?? useAuthStore.getState().language ?? 'en'
  return messages[key]?.[lang] ?? key
}

export const useTranslation = () => {
  const lang = useAuthStore((s) => s.language)
  return { t: (key: keyof typeof messages) => t(key, lang) }
}
