import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useCashInStore } from '../../../../../src/stores/cashInStore'

export default function CashInDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const request = useCashInStore((s) => s.requests.find((r) => r.id === id))
  if (!request) return <Text style={{ padding: 16 }}>Introuvable</Text>
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cash-in</Text>
      <Text>Montant: {request.amount_xof}</Text>
      <Text>Status: {request.status}</Text>
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16, gap: 8 }, title: { fontSize: 18, fontWeight: '700' } })
