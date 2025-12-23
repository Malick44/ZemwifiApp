import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function HostKyc() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vérification KYC</Text>
      <Text>Envoyez vos documents pour activer les paiements.</Text>
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24 }, title: { fontSize: 18, fontWeight: '700' } })
