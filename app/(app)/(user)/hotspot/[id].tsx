import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useLocalSearchParams, Link } from 'expo-router'
import { useDiscoveryStore } from '../../../../src/stores/discoveryStore'
import { Button } from '../../../../src/components/ui/Button'

export default function HotspotDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { hotspots, fetchHotspots, plans, fetchPlansForHotspot } = useDiscoveryStore()
  const hotspot = hotspots.find((h) => h.id === id)

  useEffect(() => {
    fetchHotspots()
    if (id) fetchPlansForHotspot(id)
  }, [fetchHotspots, fetchPlansForHotspot, id])

  if (!hotspot) return <Text style={{ padding: 16 }}>Hotspot introuvable</Text>

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{hotspot.name}</Text>
      <Text>{hotspot.address}</Text>
      <Text style={styles.subtitle}>Plans</Text>
      {(plans[id!] ?? []).map((plan) => (
        <View key={plan.id} style={styles.plan}>
          <View>
            <Text style={styles.name}>{plan.name}</Text>
            <Text>{plan.price_xof} XOF</Text>
          </View>
          <Link
            href={{ pathname: '/(app)/(user)/payment/method', params: { planId: plan.id, hotspotId: hotspot.id } }}
            asChild
          >
            <Button label="Choisir" />
          </Link>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { marginTop: 12, fontWeight: '600' },
  plan: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: '600' },
})
