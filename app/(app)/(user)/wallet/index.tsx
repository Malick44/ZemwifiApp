import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Badge } from '../../../../src/components/ui/Badge'
import { Button } from '../../../../src/components/ui/Button'
import { Card } from '../../../../src/components/ui/Card'
import { EmptyState } from '../../../../src/components/ui/EmptyState'
import { LoadingState } from '../../../../src/components/ui/LoadingState'
import { Typography } from '../../../../src/components/ui/Typography'
import { useWalletStore } from '../../../../src/stores/walletStore'

export default function WalletScreen() {
  const { vouchers, balance, refresh, loading } = useWalletStore()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'active' | 'used'>('active')
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  
  useEffect(() => {
    refresh()
  }, [])

  const activeVouchers = vouchers.filter(v => !v.used_at && new Date(v.expires_at) > new Date())
  const usedVouchers = vouchers.filter(v => v.used_at)
  const expiredVouchers = vouchers.filter(v => !v.used_at && new Date(v.expires_at) <= new Date())

  if (loading && vouchers.length === 0) {
    return <LoadingState message="Chargement du portefeuille..." />
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.container}>
      {/* Balance Card */}
      <Card variant="elevated" style={[styles.balanceCard, { backgroundColor: colors.tint }]}>
        <View style={styles.balanceContent}>
          <View style={styles.balanceInfo}>
            <Typography variant="body" style={{ color: '#fff', opacity: 0.9 }}>
              Solde disponible
            </Typography>
            <Typography variant="h1" style={{ color: '#fff', marginTop: 4 }}>
              {balance.toLocaleString()} XOF
            </Typography>
          </View>
          <Ionicons name="wallet" size={48} color="#fff" style={{ opacity: 0.3 }} />
        </View>
        <View style={styles.balanceActions}>
          <Link href="/(app)/(user)/wallet/topup-qr" asChild style={{ flex: 1 }}>
            <Button 
              label="Recharger" 
              variant="secondary" 
              leftIcon={<Ionicons name="add-circle-outline" size={20} color={colors.tint} />}
            />
          </Link>
        </View>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <Card variant="outlined" style={styles.statCard}>
          <Typography variant="h2" color={colors.success}>
            {activeVouchers.length}
          </Typography>
          <Typography variant="caption" color={colors.textSecondary}>
            Actifs
          </Typography>
        </Card>
        <Card variant="outlined" style={styles.statCard}>
          <Typography variant="h2" color={colors.textSecondary}>
            {usedVouchers.length}
          </Typography>
          <Typography variant="caption" color={colors.textSecondary}>
            Utilisés
          </Typography>
        </Card>
        <Card variant="outlined" style={styles.statCard}>
          <Typography variant="h2" color={colors.warning}>
            {expiredVouchers.length}
          </Typography>
          <Typography variant="caption" color={colors.textSecondary}>
            Expirés
          </Typography>
        </Card>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'active' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('active')}
        >
          <Typography 
            variant="body" 
            color={activeTab === 'active' ? colors.tint : colors.textSecondary}
            style={{ fontWeight: activeTab === 'active' ? '600' : '400' }}
          >
            Vouchers actifs
          </Typography>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'used' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('used')}
        >
          <Typography 
            variant="body" 
            color={activeTab === 'used' ? colors.tint : colors.textSecondary}
            style={{ fontWeight: activeTab === 'used' ? '600' : '400' }}
          >
            Historique
          </Typography>
        </Pressable>
      </View>

      {/* Vouchers List */}
      <View style={styles.vouchersContainer}>
        {activeTab === 'active' ? (
          activeVouchers.length === 0 ? (
            <EmptyState 
              title="Aucun voucher actif" 
              message="Achetez un plan pour obtenir des vouchers et accéder au Wi-Fi"
              icon="ticket-outline"
              action={{
                label: "Explorer les hotspots",
                onPress: () => router.push('/(app)/(user)/map')
              }}
            />
          ) : (
            activeVouchers.map((voucher) => (
              <Pressable
                key={voucher.id}
                onPress={() => router.push({
                  pathname: '/(app)/(user)/wallet/[voucherId]',
                  params: { voucherId: voucher.id }
                })}
              >
                <Card variant="elevated" style={styles.voucherCard}>
                  <View style={styles.voucherHeader}>
                    <View style={styles.voucherIcon}>
                      <Ionicons name="qr-code" size={24} color={colors.tint} />
                    </View>
                    <View style={styles.voucherInfo}>
                      <Typography variant="h3">{voucher.code}</Typography>
                      <Typography variant="caption" color={colors.textSecondary}>
                        Expire le {formatDate(voucher.expires_at)}
                      </Typography>
                    </View>
                    <Badge variant="success" label="Actif" />
                  </View>
                  <View style={styles.voucherFooter}>
                    <View style={styles.voucherDetail}>
                      <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                      <Typography variant="caption" color={colors.textSecondary}>
                        {getTimeRemaining(voucher.expires_at)}
                      </Typography>
                    </View>
                    <Pressable style={styles.viewQRButton}>
                      <Typography variant="caption" color={colors.tint} style={{ fontWeight: '600' }}>
                        Voir le QR
                      </Typography>
                      <Ionicons name="chevron-forward" size={16} color={colors.tint} />
                    </Pressable>
                  </View>
                </Card>
              </Pressable>
            ))
          )
        ) : (
          usedVouchers.length === 0 ? (
            <EmptyState 
              title="Aucun historique" 
              message="Vous n'avez pas encore utilisé de vouchers"
              icon="time-outline"
            />
          ) : (
            usedVouchers.map((voucher) => (
              <Card key={voucher.id} variant="outlined" style={[styles.voucherCard, { opacity: 0.7 }]}>
                <View style={styles.voucherHeader}>
                  <View style={styles.voucherIcon}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  </View>
                  <View style={styles.voucherInfo}>
                    <Typography variant="h3">{voucher.code}</Typography>
                    <Typography variant="caption" color={colors.textSecondary}>
                      Utilisé le {formatDate(voucher.used_at!)}
                    </Typography>
                  </View>
                  <Badge variant="neutral" label="Utilisé" />
                </View>
              </Card>
            ))
          )
        )}
      </View>
    </ScrollView>
    </SafeAreaView>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getTimeRemaining(expiresAt: string): string {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diffMs = expires.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (diffDays > 0) return `${diffDays}j ${diffHours}h restantes`
  if (diffHours > 0) return `${diffHours}h restantes`
  return 'Expire bientôt'
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  balanceCard: {
    marginBottom: 16,
    padding: 20,
  },
  balanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  vouchersContainer: {
    gap: 12,
  },
  voucherCard: {
    marginBottom: 12,
  },
  voucherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  voucherIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voucherInfo: {
    flex: 1,
  },
  voucherFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  voucherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewQRButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
})
