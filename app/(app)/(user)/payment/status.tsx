import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, Link } from 'expo-router'
import { usePurchasesStore } from '../../../../src/stores/purchasesStore'
import { useWalletStore } from '../../../../src/stores/walletStore'
import { Button } from '../../../../src/components/ui/Button'

export default function PaymentStatus() {
  const { planId, hotspotId, provider } = useLocalSearchParams<{
    planId: string
    hotspotId: string
    provider: 'wallet' | 'wave'
  }>()
  const [purchaseId, setPurchaseId] = useState<string | null>(null)
  const { startPurchase, purchases } = usePurchasesStore()
  const wallet = useWalletStore()

  useEffect(() => {
    const run = async () => {
      if (!planId || !hotspotId) return
      const purchase = await startPurchase(hotspotId, planId, provider ?? 'wallet')
      if (purchase) {
        setPurchaseId(purchase.id)
        if (provider === 'wallet') {
          wallet.createVoucher(planId, hotspotId)
          wallet.refresh()
        }
      }
    }
    run()
  }, [hotspotId, planId, provider, startPurchase, wallet])

  if (!purchaseId) return <ActivityIndicator style={{ flex: 1 }} />
  const current = purchases.find((p) => p.id === purchaseId)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statut du paiement</Text>
      <Text>{current?.payment_status ?? 'pending'}</Text>
      <Link href={{ pathname: '/(app)/(user)/payment/success', params: { purchaseId } }} asChild>
        <Button label="Continuer" />
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24, gap: 12 }, title: { fontSize: 18, fontWeight: '700' } })
