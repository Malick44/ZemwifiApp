import { Colors } from '@/constants/theme'
import { useColors } from '@/hooks/use-colors'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '../../../../src/components/ui/Button'
import { useTranslation } from '../../../../src/lib/i18n'
import { usePurchasesStore } from '../../../../src/stores/purchasesStore'
import { useWalletStore } from '../../../../src/stores/walletStore'

export default function PaymentStatus() {
  const { planId, hotspotId, provider } = useLocalSearchParams<{
    planId: string
    hotspotId: string
    provider: 'wallet' | 'wave' | 'orange' | 'moov'
  }>()
  const [processing, setProcessing] = useState(true)
  const { startPurchase, currentPurchase, simulatePayment } = usePurchasesStore()
  const wallet = useWalletStore()
  const router = useRouter()
  const { t } = useTranslation()
  const colors = useColors()
  const styles = createStyles(colors)

  useEffect(() => {
    const processPurchase = async () => {
      if (!planId || !hotspotId) return

      // Create purchase record
      const purchase = await startPurchase(hotspotId, planId, provider ?? 'wallet')
      if (!purchase) {
        setProcessing(false)
        return
      }

      // Simulate payment processing
      await simulatePayment(purchase.id)

      // If wallet payment and successful, just refresh wallet
      if (provider === 'wallet' && purchase.status === 'confirmed') {
        await wallet.refresh()
      }

      setProcessing(false)
    }

    processPurchase()
  }, [hotspotId, planId, provider, startPurchase, simulatePayment, wallet])

  if (processing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.processing}>{t('payment_pending')}</Text>
      </SafeAreaView>
    )
  }

  const success = currentPurchase?.status === 'confirmed'

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.statusIcon, success ? styles.successIcon : styles.errorIcon]}>
        <Text style={styles.statusEmoji}>{success ? '✓' : '✗'}</Text>
      </View>

      <Text style={styles.title}>
        {success ? t('payment_success') : t('payment_failed')}
      </Text>

      <Text style={styles.status}>
        {t('status')}: {currentPurchase?.status || 'unknown'}
      </Text>

      {success && (
        <Button
          label={t('continue')}
          onPress={() => router.push('/(app)/(user)/wallet')}
        />
      )}

      {!success && (
        <Button
          label={t('retry')}
          onPress={() => router.back()}
        />
      )}
    </SafeAreaView>
  )
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', color: colors.text },
  processing: { fontSize: 16, color: colors.textSecondary, marginTop: 12 },
  status: { fontSize: 14, color: colors.textSecondary },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successIcon: {
    backgroundColor: colors.successBackground,
  },
  errorIcon: {
    backgroundColor: colors.errorBackground,
  },
  statusEmoji: {
    fontSize: 40,
    fontWeight: 'bold',
  },
})
