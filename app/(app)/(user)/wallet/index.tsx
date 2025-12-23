import React, { useEffect } from 'react'
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useWalletStore } from '../../../../src/stores/walletStore'
import { Button } from '../../../../src/components/ui/Button'
import { Card } from '../../../../src/components/ui/Card'
import { Badge } from '../../../../src/components/ui/Badge'
import { EmptyState } from '../../../../src/components/ui/EmptyState'
import { useTranslation } from '../../../../src/lib/i18n'
import { format } from '../../../../src/lib/format'

export default function WalletScreen() {
  const { vouchers, balance, refresh, loading } = useWalletStore()
  const router = useRouter()
  const { t } = useTranslation()
  
  useEffect(() => {
    refresh()
  }, [refresh])

  const activeVouchers = vouchers.filter(v => !v.used_at && new Date(v.expires_at) > new Date())
  const usedVouchers = vouchers.filter(v => v.used_at)

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.balanceLabel}>{t('balance')}</Text>
        <Text style={styles.balanceAmount}>{format.currency(balance)} XOF</Text>
        <Link href="/(app)/(user)/wallet/topup-qr" asChild>
          <Button label={t('top_up')} />
        </Link>
      </Card>

      <Text style={styles.sectionTitle}>{t('my_vouchers')}</Text>
      
      <FlatList
        data={activeVouchers}
        keyExtractor={(v) => v.id}
        refreshing={loading}
        onRefresh={refresh}
        ListEmptyComponent={
          <EmptyState 
            title="Aucun voucher actif" 
            message="Achetez un plan pour obtenir des vouchers"
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ 
              pathname: '/(modal)/qr', 
              params: { code: item.code, title: t('voucher_qr') }
            })}
          >
            <Card style={styles.voucherCard}>
              <View style={styles.voucherHeader}>
                <Text style={styles.voucherCode}>{item.code}</Text>
                <Badge text="Actif" color="green" />
              </View>
              <Text style={styles.voucherDate}>
                Expire: {format.date(item.expires_at)}
              </Text>
              <Text style={styles.tapHint}>Toucher pour voir le QR code</Text>
            </Card>
          </Pressable>
        )}
      />

      {usedVouchers.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Vouchers utilisés</Text>
          {usedVouchers.slice(0, 3).map(v => (
            <Card key={v.id} style={styles.usedVoucher}>
              <View style={styles.voucherHeader}>
                <Text style={styles.voucherCode}>{v.code}</Text>
                <Badge text="Utilisé" color="gray" />
              </View>
              <Text style={styles.voucherDate}>
                Utilisé: {format.date(v.used_at!)}
              </Text>
            </Card>
          ))}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  balanceLabel: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  balanceAmount: { fontSize: 32, fontWeight: '700', color: '#2563eb', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  voucherCard: { marginBottom: 12 },
  voucherHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  voucherCode: { fontSize: 16, fontWeight: '600', fontFamily: 'monospace' },
  voucherDate: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  tapHint: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic' },
  usedVoucher: { marginBottom: 8, opacity: 0.6 },
})
