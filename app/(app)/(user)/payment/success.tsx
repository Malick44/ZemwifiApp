import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useLocalSearchParams, Link } from 'expo-router'
import { Button } from '../../../../src/components/ui/Button'

export default function PaymentSuccess() {
  const { purchaseId } = useLocalSearchParams<{ purchaseId: string }>()
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paiement réussi</Text>
      <Text>ID: {purchaseId}</Text>
      <Link href="/(app)/(user)/wallet" asChild>
        <Button label="Voir mes vouchers" />
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24, gap: 12 }, title: { fontSize: 18, fontWeight: '700' } })
