import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function TopupQr() {
  const payload = 'cashin'
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Présentez ce code</Text>
      <View style={styles.qr}><Text>{payload}</Text></View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  qr: { width: 200, height: 200, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
})
