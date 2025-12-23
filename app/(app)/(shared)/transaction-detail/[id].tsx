import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { usePurchasesStore } from '../../../../src/stores/purchasesStore'

export default function TransactionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const purchase = usePurchasesStore((s) => s.purchases.find((p) => p.id === id))
  if (!purchase) return <Text style={{ padding: 16 }}>Introuvable</Text>
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction</Text>
      <Text>Provider: {purchase.payment_provider}</Text>
      <Text>Status: {purchase.payment_status}</Text>
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24, gap: 8 }, title: { fontSize: 18, fontWeight: '700' } })
