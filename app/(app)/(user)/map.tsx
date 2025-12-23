import React, { useEffect } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { useDiscoveryStore } from '../../../src/stores/discoveryStore'
import { Button } from '../../../src/components/ui/Button'
import { Link } from 'expo-router'

export default function MapScreen() {
  const { hotspots, fetchHotspots, loading } = useDiscoveryStore()
  useEffect(() => {
    fetchHotspots()
  }, [fetchHotspots])

  return (
    <View style={styles.container}>
      <FlatList
        data={hotspots}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.title}>Hotspots en ligne</Text>}
        refreshing={loading}
        onRefresh={fetchHotspots}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text>{item.landmark}</Text>
            </View>
            <Link href={{ pathname: '/(app)/(user)/hotspot/[id]', params: { id: item.id } }} asChild>
              <Button label="Voir" />
            </Link>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  name: { fontWeight: '600' },
})
