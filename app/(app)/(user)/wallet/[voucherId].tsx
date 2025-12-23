import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useWalletStore } from '../../../../src/stores/walletStore'

export default function VoucherDetail() {
  const { voucherId } = useLocalSearchParams<{ voucherId: string }>()
  const voucher = useWalletStore((s) => s.vouchers.find((v) => v.id === voucherId))
  if (!voucher) return <Text style={{ padding: 16 }}>Voucher introuvable</Text>
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{voucher.code}</Text>
      <Text>Expire: {voucher.expires_at}</Text>
      <View style={styles.qr}><Text>{voucher.code}</Text></View>
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }, title: { fontSize: 20, fontWeight: '700' }, qr: { width: 180, height: 180, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', borderRadius: 12 } })
