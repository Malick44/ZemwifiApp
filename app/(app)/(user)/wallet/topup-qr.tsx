import { Colors } from '@/constants/theme'
import { useColors } from '@/hooks/use-colors'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { useTranslation } from '../../../../src/lib/i18n'
import { useAuthStore } from '../../../../src/stores/authStore'

export default function TopupQr() {
  const { amount } = useLocalSearchParams<{ amount?: string }>()
  const profile = useAuthStore((s) => s.profile)
  const { t } = useTranslation()
  const colors = useColors()
  const styles = createStyles(colors)

  // Generate QR payload with user info for cash-in
  const payload = JSON.stringify({
    type: 'cashin',
    userId: profile?.id,
    phone: profile?.phone,
    amount: amount ? parseInt(amount) : 0,
    timestamp: Date.now(),
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('present_qr_code')}</Text>
      <Text style={styles.subtitle}>Montant: {amount || 0} XOF</Text>
      <View style={styles.qrWrapper}>
        <QRCode value={payload} size={200} />
      </View>
      <Text style={styles.info}>Présentez ce code à l&apos;hôte pour recharger</Text>
    </View>
  )
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 18, color: colors.primary, fontWeight: '600' },
  qrWrapper: {
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 16,
  },
  info: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 12 },
})
