import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { Link } from 'expo-router'
import { supabase } from '../../../src/lib/supabase'
import { Card } from '../../../src/components/ui/Card'
import { Button } from '../../../src/components/ui/Button'
import { useTranslation } from '../../../src/lib/i18n'
import { format } from '../../../src/lib/format'

type DashboardStats = {
  totalEarnings: number
  todayEarnings: number
  activeHotspots: number
  activeSessions: number
  totalSales: number
  pendingPayouts: number
}

export default function HostDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    setLoading(true)
    try {
      // Get user's hotspots
      const { data: hotspots } = await supabase
        .from('hotspots')
        .select('id, is_online')
      
      const hotspotIds = hotspots?.map(h => h.id) || []
      const activeHotspots = hotspots?.filter(h => h.is_online).length || 0

      // Get earnings (from purchases for host's hotspots)
      const { data: purchases } = await supabase
        .from('purchases')
        .select('amount, created_at')
        .in('hotspot_id', hotspotIds)
        .eq('payment_status', 'success')

      const totalEarnings = purchases?.reduce((sum, p) => sum + p.amount, 0) || 0
      
      // Today's earnings
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayEarnings = purchases?.filter(p => 
        new Date(p.created_at) >= today
      ).reduce((sum, p) => sum + p.amount, 0) || 0

      // Active sessions (vouchers being used)
      const { count: activeSessions } = await supabase
        .from('vouchers')
        .select('*', { count: 'exact', head: true })
        .in('hotspot_id', hotspotIds)
        .not('used_at', 'is', null)
        .gt('expires_at', new Date().toISOString())

      // Total sales count
      const totalSales = purchases?.length || 0

      // Pending payouts
      const { data: payouts } = await supabase
        .from('payout_requests')
        .select('amount')
        .eq('status', 'pending')
      
      const pendingPayouts = payouts?.reduce((sum, p) => sum + p.amount, 0) || 0

      setStats({
        totalEarnings,
        todayEarnings,
        activeHotspots,
        activeSessions: activeSessions || 0,
        totalSales,
        pendingPayouts,
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loading} accessibilityLabel="Loading dashboard">
        <ActivityIndicator size="large" color="#2563eb" accessibilityLabel="Loading indicator" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} accessibilityLabel="Host dashboard">
      <Text style={styles.title}>{t('host_dashboard')}</Text>
      
      {/* Earnings Overview */}
      <Card>
        <Text style={styles.cardTitle}>Gains</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{format.currency(stats?.totalEarnings || 0)} XOF</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Aujourd'hui</Text>
            <Text style={styles.statValue}>{format.currency(stats?.todayEarnings || 0)} XOF</Text>
          </View>
        </View>
      </Card>

      {/* Quick Stats */}
      <View style={styles.gridRow}>
        <Card style={styles.smallCard}>
          <Text style={styles.smallCardValue}>{stats?.activeHotspots || 0}</Text>
          <Text style={styles.smallCardLabel}>Hotspots actifs</Text>
        </Card>
        <Card style={styles.smallCard}>
          <Text style={styles.smallCardValue}>{stats?.activeSessions || 0}</Text>
          <Text style={styles.smallCardLabel}>Sessions actives</Text>
        </Card>
      </View>

      <View style={styles.gridRow}>
        <Card style={styles.smallCard}>
          <Text style={styles.smallCardValue}>{stats?.totalSales || 0}</Text>
          <Text style={styles.smallCardLabel}>Ventes totales</Text>
        </Card>
        <Card style={styles.smallCard}>
          <Text style={styles.smallCardValue}>{format.currency(stats?.pendingPayouts || 0)}</Text>
          <Text style={styles.smallCardLabel}>Retraits en attente</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Actions rapides</Text>
      
      <Link href="/(app)/(host)/hotspots" asChild>
        <Button label="Gérer les hotspots" />
      </Link>
      
      <Link href="/(app)/(host)/sessions" asChild>
        <Button label="Voir les sessions" />
      </Link>
      
      <Link href="/(app)/(host)/cashin" asChild>
        <Button label="Cash-in clients" />
      </Link>
      
      <Link href="/(app)/(host)/payouts" asChild>
        <Button label="Demander un retrait" />
      </Link>
    </ScrollView>
  )
}

const styles = StyleSheet.create({ 
  container: { flex: 1, padding: 16 }, 
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#6b7280' },
  statsRow: { flexDirection: 'row', gap: 16 },
  stat: { flex: 1 },
  statLabel: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '700', color: '#2563eb' },
  gridRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  smallCard: { flex: 1, alignItems: 'center', padding: 16 },
  smallCardValue: { fontSize: 28, fontWeight: '700', color: '#2563eb', marginBottom: 4 },
  smallCardLabel: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 12 },
})
