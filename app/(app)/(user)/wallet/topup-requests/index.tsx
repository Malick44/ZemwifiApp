import { Link } from 'expo-router'
import React, { useEffect } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { useCashInStore } from '../../../../../src/stores/cashInStore'

export default function CashInRequests() {
  const { requests, refresh } = useCashInStore()
  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/(app)/(user)/wallet/topup-requests/[id]', params: { id: item.id } }} style={styles.row}>
            <Text>{item.amount_xof} XOF</Text>
            <Text>{item.status}</Text>
          </Link>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, row: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#e5e7eb' } })
