import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useLocalSearchParams, Link } from 'expo-router'
import { Button } from '../../../../src/components/ui/Button'

export default function PaymentMethod() {
  const { planId, hotspotId } = useLocalSearchParams<{ planId: string; hotspotId: string }>()
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisir un moyen de paiement</Text>
      <Link
        href={{ pathname: '/(app)/(user)/payment/status', params: { planId, hotspotId, provider: 'wallet' } }}
        asChild
      >
        <Button label="Portefeuille" />
      </Link>
      <Link
        href={{ pathname: '/(app)/(user)/payment/status', params: { planId, hotspotId, provider: 'wave' } }}
        asChild
      >
        <Button label="Wave" />
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24, gap: 12 }, title: { fontSize: 18, fontWeight: '700' } })
