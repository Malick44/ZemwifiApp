import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, View, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme'
import { Button } from '../../../../src/components/ui/Button'
import { Card } from '../../../../src/components/ui/Card'
import { Header } from '../../../../src/components/ui/Header'
import { Typography } from '../../../../src/components/ui/Typography'
import { supabase } from '../../../../src/lib/supabase'
import { Purchase } from '../../../../src/types/domain'
import { COLUMNS, ENUMS, PAYMENT_STATUS_SUCCESS, TABLES } from '@/constants/db'

type ExtendedPurchase = Purchase & {
  hotspot?: { name: string; landmark?: string } | null
  plan?: { name: string } | null
}

export default function TransactionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const styles = createStyles(colors)

  const [purchase, setPurchase] = useState<ExtendedPurchase | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetchPurchaseDetails()
  }, [id])

  const fetchPurchaseDetails = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from(TABLES.PURCHASES)
        .select(
          `*,
          hotspot:${TABLES.HOTSPOTS}(${COLUMNS.HOTSPOTS.NAME}, ${COLUMNS.HOTSPOTS.LANDMARK}),
          plan:${TABLES.PLANS}(${COLUMNS.PLANS.NAME})`
        )
        .eq(COLUMNS.PURCHASES.ID, id)
        .single()

      if (error) throw error
      setPurchase(data as ExtendedPurchase)
    } catch (err: any) {
      console.error('Error fetching transaction:', err)
      setError(err.message || 'Impossible de charger la transaction')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Purchase['status']) => {
    if (PAYMENT_STATUS_SUCCESS.includes(status)) return colors.success
    if (status === ENUMS.PAYMENT_STATUS.PENDING) return colors.warning
    if (status === ENUMS.PAYMENT_STATUS.FAILED) return colors.error
    return colors.textSecondary
  }

  const getStatusIcon = (status: Purchase['status']) => {
    if (PAYMENT_STATUS_SUCCESS.includes(status)) return 'checkmark-circle'
    if (status === ENUMS.PAYMENT_STATUS.PENDING) return 'time'
    if (status === ENUMS.PAYMENT_STATUS.FAILED) return 'alert-circle'
    return 'help-circle'
  }

  const getStatusText = (status: Purchase['status']) => {
    if (PAYMENT_STATUS_SUCCESS.includes(status)) return 'Effectué'
    if (status === ENUMS.PAYMENT_STATUS.PENDING) return 'En attente'
    if (status === ENUMS.PAYMENT_STATUS.FAILED) return 'Échoué'
    if (status === ENUMS.PAYMENT_STATUS.EXPIRED) return 'Expiré'
    return status
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header showBack title="Détails" onBack={() => router.back()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    )
  }

  if (error || !purchase) {
    return (
      <SafeAreaView style={styles.container}>
        <Header showBack title="Détails" onBack={() => router.back()} />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Typography variant="body" style={{ marginTop: 16 }}>
            {error || 'Transaction introuvable'}
          </Typography>
          <Button label="Retour" onPress={() => router.back()} variant="secondary" style={{ marginTop: 24 }} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Détails de la transaction" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Status Header */}
        <View style={styles.statusHeader}>
          <Ionicons name={getStatusIcon(purchase.status)} size={64} color={getStatusColor(purchase.status)} />
          <Typography variant="h1" style={{ marginTop: 16 }}>
            {purchase.amount_xof.toLocaleString()} XOF
          </Typography>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(purchase.status) + '20' }]}>
            <Typography variant="caption" style={{ color: getStatusColor(purchase.status), fontWeight: '600' }}>
              {getStatusText(purchase.status).toUpperCase()}
            </Typography>
          </View>
        </View>

        {/* Details Card */}
        <Card variant="outlined" style={styles.detailsCard}>
          <DetailRow label="Date" value={new Date(purchase.created_at).toLocaleString('fr-FR')} colors={colors} styles={styles} />
          <DetailRow label="Référence" value={purchase.id.split('-')[0].toUpperCase()} colors={colors} styles={styles} />
          <DetailRow label="Fournisseur" value={purchase.provider.charAt(0).toUpperCase() + purchase.provider.slice(1)} colors={colors} styles={styles} />
          <DetailRow label="Plan" value={purchase.plan?.name || 'Inconnu'} colors={colors} styles={styles} />
          <DetailRow label="Hotspot" value={purchase.hotspot?.name || 'Inconnu'} colors={colors} isLast styles={styles} />
        </Card>

        {/* Help / Actions */}
        <Typography variant="caption" color="textSecondary" style={{ textAlign: 'center', marginTop: 24, marginBottom: 8 }}>
          Vous avez rencontré un problème avec cette transaction ?
        </Typography>
        <Button
          label="Signaler un problème"
          variant="secondary"
          onPress={() => {/* TODO: Implement support flow */ }}
        />

      </ScrollView>
    </SafeAreaView>
  )
}

const DetailRow = ({ label, value, isLast, colors, styles }: { label: string, value: string, isLast?: boolean, colors: any, styles: any }) => (
  <View style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
    <Typography variant="body" color="textSecondary">{label}</Typography>
    <Typography variant="body" style={{ fontWeight: '500' }}>{value}</Typography>
  </View>
)

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollContent: {
    padding: 24,
  },
  statusHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  detailsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
})
