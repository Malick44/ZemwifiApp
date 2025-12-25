import { Colors } from '@/constants/theme'
import { useColors } from '@/hooks/use-colors'
import { Link } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ScannedNetwork, scanNetworks } from '../../../src/lib/wifi-scanner'
import { useDiscoveryStore } from '../../../src/stores/discoveryStore'

export default function ListScreen() {
  const { hotspots, fetchHotspots } = useDiscoveryStore()
  const [scannedNetworks, setScannedNetworks] = useState<ScannedNetwork[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const colors = useColors()
  const styles = createStyles(colors)

  useEffect(() => {
    fetchHotspots()
  }, [fetchHotspots])

  const handleScan = async () => {
    setIsScanning(true)
    try {
      const results = await scanNetworks()
      setScannedNetworks(results)
      if (results.length === 0) {
        Alert.alert('Scan Complete', 'No networks found or permission denied.')
      }
    } catch {
      Alert.alert('Error', 'Failed to scan networks.')
    } finally {
      setIsScanning(false)
    }
  }



  return (
    <View style={styles.container}>
      <FlatList
        data={hotspots}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <TouchableOpacity style={styles.scanButton} onPress={handleScan} disabled={isScanning}>
                {isScanning ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text style={styles.scanButtonText}>Scan Nearby WiFi</Text>
                )}
              </TouchableOpacity>
            </View>

            {scannedNetworks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Available Networks ({scannedNetworks.length})</Text>
                {scannedNetworks.map((network, index) => (
                  <View key={network.bssid + index} style={styles.row}>
                    <Text style={styles.name}>{network.ssid || '(Hidden SSID)'}</Text>
                    <Text style={styles.detail}>Signal: {network.level} dBm</Text>
                    <Text style={styles.detail}>BSSID: {network.bssid}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.sectionTitle}>ZemNet Marketplace Hotspots</Text>
          </>
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: '/(app)/(user)/hotspot/[id]', params: { id: item.id } }} style={styles.row}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text>{item.address}</Text>
            </View>
          </Link>
        )}
      />
    </View>
  )
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background },
  header: { marginBottom: 16 },
  scanButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanButtonText: { color: colors.textInverse, fontWeight: 'bold' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: colors.text },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border },
  name: { fontWeight: '600', fontSize: 16, color: colors.text },
  detail: { color: colors.textSecondary, fontSize: 12 },
})

