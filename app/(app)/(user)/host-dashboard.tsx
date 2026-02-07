import { COLUMNS, ENUMS, PAYMENT_STATUS_SUCCESS, TABLES, type PaymentStatus } from '@/constants/db'
import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../constants/theme'
import { Card } from '../../../src/components/ui/Card'
import { Header } from '../../../src/components/ui/Header'
import { Typography } from '../../../src/components/ui/Typography'
import { format } from '../../../src/lib/format'
import { supabase } from '../../../src/lib/supabase'
import { useAuthStore } from '../../../src/stores/authStore'

type DashboardStats = {
  totalEarnings: number
  todayEarnings: number
  activeHotspots: number
  activeSessions: number
  totalSales: number
  pendingPayouts: number
}

// Transaction type for the list
type Transaction = {
  id: string
  amount: number
  status: PaymentStatus
  created_at: string
  hotspot: { name: string } | null
}

// Type for purchase query result with aliased columns
type PurchaseQueryResult = {
  id: string
  amount: number
  status: string
  created_at: string
  hotspot: { name: string } | null
}

export default function HostDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isOnline, setIsOnline] = useState(true) // Global online status
  // const { t } = useTranslation() // Unused
  const profile = useAuthStore((s) => s.profile)
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']

  const loadDashboardData = React.useCallback(async () => {
    try {
      if (!refreshing) setLoading(true)

      // 1. Fetch Stats (Same logic as before, consolidated)
      const { data: hotspots } = await supabase
        .from(TABLES.HOTSPOTS)
        .select(`${COLUMNS.HOTSPOTS.ID}, ${COLUMNS.HOTSPOTS.IS_ONLINE}`)
      const hotspotIds = hotspots?.map(h => h.id) || []
      const activeHotspots = hotspots?.filter(h => h.is_online).length || 0

      const { data: purchaseData } = await supabase
        .from(TABLES.PURCHASES)
        .select(
          `amount:${COLUMNS.PURCHASES.AMOUNT}, ` +
          `${COLUMNS.PURCHASES.CREATED_AT}, ` +
          `status:${COLUMNS.PURCHASES.PAYMENT_STATUS}, ` +
          `${COLUMNS.PURCHASES.ID}, ` +
          `hotspot:${TABLES.HOTSPOTS}(${COLUMNS.HOTSPOTS.NAME})`
        )
        .in(COLUMNS.PURCHASES.HOTSPOT_ID, hotspotIds)
        .order(COLUMNS.PURCHASES.CREATED_AT, { ascending: false })
        .limit(5)

      const purchases = (purchaseData || []) as unknown as PurchaseQueryResult[]
      const completedPurchases = purchases.filter(p => PAYMENT_STATUS_SUCCESS.includes(p.status as PaymentStatus))
      const totalEarnings = completedPurchases.reduce((sum, p) => sum + p.amount, 0)

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayEarnings = completedPurchases.filter(p => new Date(p.created_at) >= today)
        .reduce((sum, p) => sum + p.amount, 0)

      const { count: activeSessions } = await supabase
        .from(TABLES.VOUCHERS)
        .select('*', { count: 'exact', head: true })
        .in(COLUMNS.VOUCHERS.HOTSPOT_ID, hotspotIds)
        .not(COLUMNS.VOUCHERS.USED_AT, 'is', null)
        .gt(COLUMNS.VOUCHERS.EXPIRES_AT, new Date().toISOString())

      const { data: payouts } = await supabase
        .from(TABLES.PAYOUTS)
        .select(`amount:${COLUMNS.PAYOUTS.AMOUNT}`)
        .eq(COLUMNS.PAYOUTS.STATUS, ENUMS.PAYOUT_STATUS.PENDING)

      const pendingPayouts = payouts?.reduce((sum, p) => sum + p.amount, 0) || 0

      setStats({
        totalEarnings,
        todayEarnings,
        activeHotspots,
        activeSessions: activeSessions || 0,
        totalSales: completedPurchases.length,
        pendingPayouts,
      })

      // Set recent transactions
      setTransactions(purchases.map(p => ({
        id: p.id,
        amount: p.amount,
        status: p.status as PaymentStatus,
        created_at: p.created_at,
        hotspot: p.hotspot
      })))

    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [refreshing])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const onRefresh = () => {
    setRefreshing(true)
    loadDashboardData()
  }

  const toggleOnlineStatus = () => {
    // In a real app, this would update all hotspots or a global host status
    setIsOnline(!isOnline)
  }

  if (loading && !stats) {
    return (
      <SafeAreaView style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <Header
          variant="large"
          title={`Bonjour, ${profile?.name?.split(' ')[0] || 'Hôte'}`}
          subtitle={isOnline ? 'Vos services sont en ligne' : 'Vous êtes hors ligne'}
          rightAction={
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable onPress={toggleOnlineStatus} style={[styles.iconButton, { backgroundColor: colors.secondary }]}>
                <Ionicons name={isOnline ? "power" : "power-outline"} size={20} color={isOnline ? colors.success : colors.textSecondary} />
              </Pressable>
              <Link href="/(app)/(user)/settings" asChild>
                <Pressable style={[styles.iconButton, { backgroundColor: colors.secondary }]}>
                  <Ionicons name="settings-outline" size={20} color={colors.text} />
                </Pressable>
              </Link>
            </View>
          }
        />

        {/* Main Earnings Card */}
        <View style={[styles.mainCard, { backgroundColor: colors.primary }]}>
          <View style={styles.mainCardHeader}>
            <Typography variant="body" style={{ color: 'rgba(255,255,255,0.8)' }}>Solde disponible</Typography>
            <Ionicons name="wallet-outline" size={24} color="white" />
          </View>
          <Typography variant="h1" style={{ color: 'white', fontSize: 36, marginBottom: 8 }}>
            {format.currency(stats?.totalEarnings || 0)}
          </Typography>
          <View style={styles.mainCardFooter}>
            <View>
              <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.6)' }}>Aujourd&apos;hui</Typography>
              <Typography variant="h4" style={{ color: 'white' }}>+{format.currency(stats?.todayEarnings || 0)}</Typography>
            </View>
            <Link href="/(app)/(host)/payouts" asChild>
              <TouchableOpacity style={styles.withdrawButton}>
                <Typography variant="button" style={{ color: colors.primary, fontSize: 12 }}>Retirer</Typography>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <Card variant="outlined" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.secondary }]}>
              <Ionicons name="wifi" size={20} color={colors.primary} />
            </View>
            <Typography variant="h3">{stats?.activeHotspots || 0}</Typography>
            <Typography variant="caption" color="textSecondary">Hotspots actifs</Typography>
          </Card>

          <Card variant="outlined" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="people" size={20} color={colors.success} />
            </View>
            <Typography variant="h3">{stats?.activeSessions || 0}</Typography>
            <Typography variant="caption" color="textSecondary">Utilisateurs</Typography>
          </Card>

          <Card variant="outlined" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="cart" size={20} color="#3b82f6" />
            </View>
            <Typography variant="h3">{stats?.totalSales || 0}</Typography>
            <Typography variant="caption" color="textSecondary">Ventes</Typography>
          </Card>
        </View>

        {/* Quick Actions */}
        <Typography variant="h4" style={styles.sectionTitle}>Vue d&apos;ensemble</Typography>
        <Card variant="filled" style={styles.statsGrid}>
          <Link href="/(app)/(host)/cashin" asChild>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]}>
              <Ionicons name="cash-outline" size={24} color={colors.primary} />
              <Typography variant="caption" style={styles.actionBtnText}>Cash-in</Typography>
            </TouchableOpacity>
          </Link>
          <Link href="/(app)/(host)/hotspots" asChild>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]}>
              <Ionicons name="hardware-chip-outline" size={24} color={colors.primary} />
              <Typography variant="caption" style={styles.actionBtnText}>Hotspots</Typography>
            </TouchableOpacity>
          </Link>
          <Link href="/(app)/(host)/claim" asChild>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]}>
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
              <Typography variant="caption" style={styles.actionBtnText}>Ajouter</Typography>
            </TouchableOpacity>
          </Link>
          <Link href="/(app)/(host)/technician-requests" asChild>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]}>
              <Ionicons name="build-outline" size={24} color={colors.primary} />
              <Typography variant="caption" style={styles.actionBtnText}>Support</Typography>
            </TouchableOpacity>
          </Link>
        </Card>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Typography variant="h3">Transactions récentes</Typography>
          <Link href="/(app)/(host)/earnings" asChild>
            <Pressable>
              <Typography variant="button" color="primary">Voir tout</Typography>
            </Pressable>
          </Link>
        </View>

        <View style={styles.transactionsList}>
          {transactions.length === 0 ? (
            <Typography variant="body" color="textSecondary" style={{ textAlign: 'center', padding: 20 }}>
              Aucune transaction récente
            </Typography>
          ) : (
            transactions.map((tx) => {
              const isSuccess = PAYMENT_STATUS_SUCCESS.includes(tx.status)
              return (
                <Link key={tx.id} href={`/(app)/(shared)/transaction-detail/${tx.id}`} asChild>
                  <Pressable style={[styles.transactionItem, { borderBottomColor: colors.border }]}>
                    <View style={styles.txIcon}>
                      <Ionicons
                        name={isSuccess ? "arrow-down" : "time"}
                        size={18}
                        color={isSuccess ? colors.success : colors.warning}
                      />
                    </View>
                    <View style={styles.txDetails}>
                      <Typography variant="body" style={styles.txTitle}>
                        Vente forfait - {tx.hotspot?.name || 'Inconnu'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {format.date(tx.created_at)}
                      </Typography>
                    </View>
                    <Typography
                      variant="body"
                      style={[styles.txAmount, { color: isSuccess ? colors.success : colors.text }]}
                    >
                      +{format.currency(tx.amount)}
                    </Typography>
                  </Pressable>
                </Link>
              )
            })
          )}
        </View>

      </ScrollView>
    </SafeAreaView >
  )
}

// Helper component for TouchableOpacity to avoid TS errors with asChild
const TouchableOpacity = React.forwardRef((props: any, ref: any) => (
  <Pressable ref={ref} {...props} />
))
TouchableOpacity.displayName = 'TouchableOpacity'


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 24,
    padding: 24,
    // Add shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mainCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  withdrawButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 16,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  actionsScroll: {
    marginBottom: 24,
  },
  actionBtn: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionBtnText: {
    marginTop: 8,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  transactionsList: {
    paddingHorizontal: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontWeight: '500',
    marginBottom: 2,
  },
  txAmount: {
    fontWeight: '600',
  },
})
