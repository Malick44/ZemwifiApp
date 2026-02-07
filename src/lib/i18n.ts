import { useAuthStore } from '../stores/authStore';

type Messages = Record<string, { en: string; fr: string }>

const messages: Messages = {
  // Auth & Welcome
  welcome_title: { en: 'Welcome to ZemNet', fr: 'Bienvenue sur ZemNet' },
  continue: { en: 'Continue', fr: 'Continuer' },
  continue_as_guest: { en: 'Continue as guest', fr: 'Continuer en invité' },
  back: { en: 'Back', fr: 'Retour' },
  phone_label: { en: 'Phone number', fr: 'Numéro de téléphone' },
  otp_label: { en: 'Enter code', fr: 'Entrez le code' },
  otp_sent: { en: 'Code sent', fr: 'Code envoyé' },
  verify: { en: 'Verify', fr: 'Vérifier' },
  profile_title: { en: 'Your profile', fr: 'Votre profil' },
  full_name: { en: 'Full name', fr: 'Nom complet' },
  save: { en: 'Save', fr: 'Enregistrer' },
  sign_out: { en: 'Sign out', fr: 'Déconnexion' },
  
  // Navigation
  map_tab: { en: 'Map', fr: 'Carte' },
  list_tab: { en: 'List', fr: 'Liste' },
  wallet_tab: { en: 'Wallet', fr: 'Portefeuille' },
  host_tab: { en: 'Host', fr: 'Hôte' },
  settings_tab: { en: 'Settings', fr: 'Réglages' },
  
  // Discovery
  hotspots_online: { en: 'Online Hotspots', fr: 'Hotspots en ligne' },
  search_hotspots: { en: 'Search hotspots', fr: 'Rechercher des hotspots' },
  view_details: { en: 'View', fr: 'Voir' },
  select_plan: { en: 'Select', fr: 'Choisir' },
  no_hotspots: { en: 'No hotspots available', fr: 'Aucun hotspot disponible' },
  
  // Payment
  payment_method: { en: 'Payment method', fr: 'Moyen de paiement' },
  pay_with_wallet: { en: 'Pay with wallet', fr: 'Payer avec portefeuille' },
  payment_status: { en: 'Payment status', fr: 'Statut du paiement' },
  payment_success: { en: 'Payment successful', fr: 'Paiement réussi' },
  payment_failed: { en: 'Payment failed', fr: 'Paiement échoué' },
  payment_pending: { en: 'Processing...', fr: 'Traitement...' },
  
  // Wallet
  balance: { en: 'Balance', fr: 'Solde' },
  vouchers: { en: 'Vouchers', fr: 'Bons' },
  my_vouchers: { en: 'My vouchers', fr: 'Mes bons' },
  voucher_code: { en: 'Voucher Code', fr: 'Code du bon' },
  present_qr_code: { en: 'Present this code to the host', fr: 'Présentez ce code à l\'hôte' },
  top_up: { en: 'Top up', fr: 'Recharger' },
  history: { en: 'History', fr: 'Historique' },
  transactions: { en: 'Transactions', fr: 'Transactions' },
  
  // Host
  host_dashboard: { en: 'Host Dashboard', fr: 'Tableau de bord hôte' },
  earnings: { en: 'Earnings', fr: 'Gains' },
  payouts: { en: 'Payouts', fr: 'Retraits' },
  active_sessions: { en: 'Active sessions', fr: 'Sessions actives' },
  cash_in: { en: 'Cash-in', fr: 'Cash-in' },
  
  // Common
  loading: { en: 'Loading...', fr: 'Chargement...' },
  error_generic: { en: 'Something went wrong', fr: 'Une erreur est survenue' },
  retry: { en: 'Retry', fr: 'Réessayer' },
  cancel: { en: 'Cancel', fr: 'Annuler' },
  confirm: { en: 'Confirm', fr: 'Confirmer' },
  success: { en: 'Success', fr: 'Succès' },
  failed: { en: 'Failed', fr: 'Échoué' },
  amount: { en: 'Amount', fr: 'Montant' },
  status: { en: 'Status', fr: 'Statut' },
  date: { en: 'Date', fr: 'Date' },
}

export const t = (key: keyof typeof messages, language?: 'en' | 'fr'): string => {
  const lang = language ?? useAuthStore.getState().language ?? 'en'
  return messages[key]?.[lang] ?? key
}

export const useTranslation = () => {
  const lang = useAuthStore((s) => s.language)
  return { t: (key: keyof typeof messages) => t(key, lang) }
}
