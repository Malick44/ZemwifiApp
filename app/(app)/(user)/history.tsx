import React, { useEffect } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { usePurchasesStore } from '../../../src/stores/purchasesStore'

export default function HistoryScreen() {
  const { purchases, refreshPurchases } = usePurchasesStore()
  useEffect(() => {
    refreshPurchases()
  }, [refreshPurchases])

  return (
    <View style={styles.container}>
      <FlatList
        data={purchases}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.payment_provider}</Text>
            <Text>{item.payment_status}</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#e5e7eb' } })
