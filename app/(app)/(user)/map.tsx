import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { FlatList, Pressable, StyleSheet, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '../../../src/components/ui/Button'
import { Card } from '../../../src/components/ui/Card'
import { EmptyState } from '../../../src/components/ui/EmptyState'
import { Typography } from '../../../src/components/ui/Typography'
import { useDiscoveryStore } from '../../../src/stores/discoveryStore'

export default function MapScreen() {
  const { hotspots, fetchHotspots, loading } = useDiscoveryStore()
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list')
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  
  useEffect(() => {
    fetchHotspots()
  }, [fetchHotspots])

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with toggle */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Typography variant="h2">Découvrir</Typography>
        <View style={styles.toggleContainer}>
          <Pressable 
            style={[styles.toggleButton, viewMode === 'list' && { backgroundColor: colors.tint }]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons 
              name="list" 
              size={20} 
              color={viewMode === 'list' ? '#fff' : colors.text} 
            />
          </Pressable>
          <Pressable 
            style={[styles.toggleButton, viewMode === 'map' && { backgroundColor: colors.tint }]}
            onPress={() => setViewMode('map')}
          >
            <Ionicons 
              name="map" 
              size={20} 
              color={viewMode === 'map' ? '#fff' : colors.text} 
            />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      {viewMode === 'list' ? (
        <FlatList
          data={hotspots}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchHotspots}
          ListEmptyComponent={
            <EmptyState 
              title="Aucun hotspot"
              message="Aucun hotspot disponible pour le moment"
              icon="close-circle"
            />
          }
          renderItem={({ item }) => (
            <Card variant="elevated" style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.cardInfo}>
                  <Typography variant="h3">{item.name}</Typography>
                  <Typography variant="body" color={colors.textSecondary}>
                    {item.landmark || item.address}
                  </Typography>
                  {item.status === 'online' && (
                    <View style={styles.statusBadge}>
                      <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                      <Typography variant="caption" color={colors.success}>En ligne</Typography>
                    </View>
                  )}
                </View>
                <Link href={{ pathname: '/(app)/(user)/hotspot/[id]', params: { id: item.id } }} asChild>
                  <Button label="Voir" size="sm" />
                </Link>
              </View>
            </Card>
          )}
        />
      ) : (
        <View style={styles.mapPlaceholder}>
          <EmptyState 
            title="Carte interactive"
            message="La vue carte sera disponible prochainement avec react-native-maps"
            icon="map"
          />
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
})
