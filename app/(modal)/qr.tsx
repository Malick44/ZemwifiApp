import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function QrModal() {
  const value = 'zemnet'
  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR Voucher</Text>
      <View style={styles.qr}><Text>{value}</Text></View>
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }, title: { fontSize: 18, fontWeight: '700' }, qr: { width: 220, height: 220, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', borderRadius: 12 } })
