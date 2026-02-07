import { ENUMS, PAYMENT_STATUS_SUCCESS } from '@/constants/db'
import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { FlatList, Pressable, ScrollView, StyleSheet, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Badge } from '../../../src/components/ui/Badge'
import { Card } from '../../../src/components/ui/Card'
import { EmptyState } from '../../../src/components/ui/EmptyState'
import { Header } from '../../../src/components/ui/Header'
import { LoadingState } from '../../../src/components/ui/LoadingState'
import { Typography } from '../../../src/components/ui/Typography'
import { usePurchasesStore } from '../../../src/stores/purchasesStore'
import { Purchase } from '../../../src/types/domain'

type FilterType = 'all' | Purchase['status']

export default function HistoryScreen() {
  const { purchases, refreshPurchases, loading } = usePurchasesStore()
  const [filter, setFilter] = useState<FilterType>('all')
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']

  useEffect(() => {
    refreshPurchases()
  }, [])

  const filteredPurchases = purchases.filter(p => {
    if (filter === 'all') return true
    if (PAYMENT_STATUS_SUCCESS.includes(filter)) {
      return PAYMENT_STATUS_SUCCESS.includes(p.status)
    }
    return p.status === filter
  })

  const getStatusVariant = (status: Purchase['status']) => {
    if (PAYMENT_STATUS_SUCCESS.includes(status)) return 'success'
    if (status === ENUMS.PAYMENT_STATUS.PENDING) return 'warning'
    if (status === ENUMS.PAYMENT_STATUS.FAILED) return 'error'
    return 'neutral'
  }

  const getStatusText = (status: Purchase['status']) => {
    if (PAYMENT_STATUS_SUCCESS.includes(status)) return 'Réussi'
    if (status === ENUMS.PAYMENT_STATUS.PENDING) return 'En attente'
    if (status === ENUMS.PAYMENT_STATUS.FAILED) return 'Échoué'
    if (status === ENUMS.PAYMENT_STATUS.EXPIRED) return 'Expiré'
    return status
  }

  const getPaymentIcon = (provider?: string) => {
    switch (provider) {
      case 'wave': return 'phone-portrait-outline'
      case 'orange': return 'phone-portrait-outline'
      case 'moov': return 'phone-portrait-outline'
      case 'wallet': return 'wallet-outline'
      default: return 'card-outline'
    }
  }

  if (loading && purchases.length === 0) {
    return <LoadingState message="Chargement de l'historique..." />
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Header
        variant="large"
        title="Historique"
        subtitle={`${purchases.length} transaction${purchases.length > 1 ? 's' : ''}`}
      />

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContainer}
      >
        {[
          { key: 'all' as const, label: 'Tout', count: purchases.length },
          { key: ENUMS.PAYMENT_STATUS.SUCCESS, label: 'Réussi', count: purchases.filter(p => PAYMENT_STATUS_SUCCESS.includes(p.status)).length },
          { key: ENUMS.PAYMENT_STATUS.PENDING, label: 'En attente', count: purchases.filter(p => p.status === ENUMS.PAYMENT_STATUS.PENDING).length },
          { key: ENUMS.PAYMENT_STATUS.FAILED, label: 'Échoué', count: purchases.filter(p => p.status === ENUMS.PAYMENT_STATUS.FAILED).length },
        ].map(({ key, label, count }) => (
          <Pressable
            key={key}
            onPress={() => setFilter(key)}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === key ? colors.tint : colors.card,
                borderColor: filter === key ? colors.tint : colors.border,
              }
            ]}
          >
            <Typography
              variant="body"
              color={filter === key ? '#fff' : colors.text}
              style={{ fontWeight: filter === key ? '600' : '400' }}
            >
              {label}
            </Typography>
            {count > 0 && (
              <View style={[
                styles.countBadge,
                { backgroundColor: filter === key ? 'rgba(255,255,255,0.2)' : colors.backgroundSecondary }
              ]}>
                <Typography
                  variant="caption"
                  color={filter === key ? '#fff' : colors.textSecondary}
                  style={{ fontWeight: '600' }}
                >
                  {count}
                </Typography>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>

      {/* Transactions List */}
      <FlatList
        data={filteredPurchases}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={refreshPurchases}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="Aucune transaction"
            message={filter === 'all'
              ? "Vous n'avez pas encore effectué d'achats"
              : `Aucune transaction ${getStatusText(filter).toLowerCase()}`}
            icon="receipt-outline"
            action={filter !== 'all' ? {
              label: "Voir toutes les transactions",
              onPress: () => setFilter('all')
            } : undefined}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({
              pathname: '/(app)/(shared)/transaction-detail/[id]',
              params: { id: item.id }
            })}
          >
            <Card variant="elevated" style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View style={[styles.iconContainer, { backgroundColor: colors.backgroundSecondary }]}>
                  <Ionicons
                    name={getPaymentIcon(item.provider)}
                    size={24}
                    color={colors.tint}
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Typography variant="h3" numberOfLines={1} ellipsizeMode="tail" style={{ flexShrink: 1 }}>
                    Plan {item.plan_id}
                  </Typography>
                  <Typography variant="caption" color={colors.textSecondary}>
                    {formatDate(item.created_at)}
                  </Typography>
                </View>
                <View style={styles.transactionRight}>
                  <Typography variant="h3" color={colors.text}>
                    {(item.amount_xof || 0).toLocaleString()} XOF
                  </Typography>
                  <Badge
                    variant={getStatusVariant(item.status)}
                    label={getStatusText(item.status)}
                    size="sm"
                  />
                </View>
              </View>

              <View style={styles.transactionDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                  <Typography variant="caption" color={colors.textSecondary}>
                    Hotspot {(item.hotspot_id || '').slice(0, 8)}...
                  </Typography>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name={getPaymentIcon(item.provider)} size={14} color={colors.textSecondary} />
                  <Typography variant="caption" color={colors.textSecondary}>
                    {(item.provider || 'Inconnu').charAt(0).toUpperCase() + (item.provider || 'Inconnu').slice(1)}
                  </Typography>
                </View>
              </View>

              <Pressable style={styles.viewDetailButton}>
                <Typography variant="caption" color={colors.tint} style={{ fontWeight: '600' }}>
                  Voir les détails
                </Typography>
                <Ionicons name="chevron-forward" size={16} color={colors.tint} />
              </Pressable>
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filtersScroll: {
    marginBottom: 8,
    minHeight: 50,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12, // Added top padding
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 8, // Add spacing between info and amount
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  transactionDetails: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
})
