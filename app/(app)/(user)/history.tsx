import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native'
import { Link } from 'expo-router'
import { usePurchasesStore } from '../../../src/stores/purchasesStore'
import { Purchase } from '../../../src/types/domain'
import { Card } from '../../../src/components/ui/Card'
import { Badge } from '../../../src/components/ui/Badge'
import { EmptyState } from '../../../src/components/ui/EmptyState'
import { useTranslation } from '../../../src/lib/i18n'
import { format } from '../../../src/lib/format'

type FilterType = 'all' | 'success' | 'pending' | 'failed'

export default function HistoryScreen() {
  const { purchases, refreshPurchases, loading } = usePurchasesStore()
  const [filter, setFilter] = useState<FilterType>('all')
  const { t } = useTranslation()

  useEffect(() => {
    refreshPurchases()
  }, [refreshPurchases])

  const filteredPurchases = purchases.filter(p => {
    if (filter === 'all') return true
    return p.payment_status === filter
  })

  const getStatusColor = (status: Purchase['payment_status']) => {
    switch (status) {
      case 'success': return 'green'
      case 'pending': return 'orange'
      case 'failed': return 'red'
      default: return 'gray'
    }
  }

  const getStatusText = (status: Purchase['payment_status']) => {
    switch (status) {
      case 'success': return t('success')
      case 'pending': return t('payment_pending')
      case 'failed': return t('failed')
      default: return status
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('history')}</Text>
      
      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'success', 'pending', 'failed'] as FilterType[]).map(type => (
          <Pressable
            key={type}
            style={[styles.filterTab, filter === type && styles.filterTabActive]}
            onPress={() => setFilter(type)}
          >
            <Text style={[styles.filterText, filter === type && styles.filterTextActive]}>
              {type === 'all' ? 'Tout' : 
               type === 'success' ? 'Succès' :
               type === 'pending' ? 'En attente' :
               'Échoué'}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredPurchases}
        keyExtractor={(p) => p.id}
        refreshing={loading}
        onRefresh={refreshPurchases}
        ListEmptyComponent={
          <EmptyState 
            title="Aucune transaction"
            message="Vos achats apparaîtront ici"
          />
        }
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: '/(app)/(shared)/transaction-detail/[id]',
              params: { id: item.id }
            }}
            asChild
          >
            <Pressable>
              <Card style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.amount}>
                      {format.currency(item.amount)} XOF
                    </Text>
                    <Text style={styles.provider}>
                      {item.payment_provider.toUpperCase()}
                    </Text>
                    <Text style={styles.date}>
                      {format.date(item.created_at)}
                    </Text>
                  </View>
                  <Badge 
                    text={getStatusText(item.payment_status)} 
                    color={getStatusColor(item.payment_status)} 
                  />
                </View>
                {item.payment_reference && (
                  <Text style={styles.reference}>
                    Réf: {item.payment_reference}
                  </Text>
                )}
              </Card>
            </Pressable>
          </Link>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({ 
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  filterRow: { 
    flexDirection: 'row', 
    gap: 8, 
    marginBottom: 16,
    backgroundColor: '#f3f4f6',
    padding: 4,
    borderRadius: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  transactionCard: { marginBottom: 12 },
  transactionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  },
  transactionInfo: { flex: 1 },
  amount: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  provider: { fontSize: 14, color: '#6b7280', marginBottom: 2 },
  date: { fontSize: 12, color: '#9ca3af' },
  reference: { fontSize: 12, color: '#9ca3af', marginTop: 8, fontFamily: 'monospace' },
})
