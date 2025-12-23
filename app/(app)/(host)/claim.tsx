import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function HostClaim() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demande de revendication</Text>
      <Text>Confirmez votre propriété de hotspot.</Text>
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24 }, title: { fontSize: 18, fontWeight: '700' } })
