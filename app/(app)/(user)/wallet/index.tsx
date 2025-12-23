import React, { useEffect } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { useWalletStore } from '../../../../src/stores/walletStore'
import { Button } from '../../../../src/components/ui/Button'
import { Link } from 'expo-router'

const VoucherCode = ({ code }: { code: string }) => (
  <View style={styles.qr}><Text style={styles.qrText}>{code}</Text></View>
)

export default function WalletScreen() {
  const { vouchers, balance, refresh } = useWalletStore()
  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <View style={styles.container}>
      <Text style={styles.balance}>Solde: {balance} XOF</Text>
      <FlatList
        data={vouchers}
        keyExtractor={(v) => v.id}
        ListEmptyComponent={<Text>Aucun voucher</Text>}
        renderItem={({ item }) => (
          <View style={styles.voucher}>
            <View>
              <Text>{item.code}</Text>
              <Text>Expire: {item.expires_at}</Text>
            </View>
            <VoucherCode code={item.code} />
          </View>
        )}
      />
      <Link href="/(app)/(user)/wallet/topup-qr" asChild>
        <Button label="Recharger" />
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  balance: { fontSize: 18, fontWeight: '700' },
  voucher: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  qr: { width: 64, height: 64, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  qrText: { fontSize: 10 },
})
