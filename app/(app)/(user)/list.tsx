import React, { useEffect } from 'react'
import { View, FlatList, Text, StyleSheet } from 'react-native'
import { useDiscoveryStore } from '../../../src/stores/discoveryStore'
import { Link } from 'expo-router'

export default function ListScreen() {
  const { hotspots, fetchHotspots } = useDiscoveryStore()
  useEffect(() => {
    fetchHotspots()
  }, [fetchHotspots])

  return (
    <View style={styles.container}>
      <FlatList
        data={hotspots}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/(app)/(user)/hotspot/[id]', params: { id: item.id } }} style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.address}</Text>
          </Link>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  name: { fontWeight: '600' },
})
