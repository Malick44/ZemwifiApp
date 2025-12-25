import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../constants/theme'
import { Badge } from '../../../src/components/ui/Badge'
import { Card } from '../../../src/components/ui/Card'
import { Typography } from '../../../src/components/ui/Typography'
import { format } from '../../../src/lib/format'
import { useHostHotspotStore } from '../../../src/stores/hostHotspotStore'

export default function SessionsScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const [refreshing, setRefreshing] = useState(false)

  const { activeSessions, fetchActiveSessions } = useHostHotspotStore()

  useEffect(() => {
    fetchActiveSessions()
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchActiveSessions()
    setRefreshing(false)
  }, [fetchActiveSessions])

  const handleDisconnect = (id: string) => {
    // TODO: Implement disconnect logic in store
    console.log('Disconnect session:', id)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="h3">Sessions Actives</Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Typography variant="body" color="textSecondary" style={styles.subtitle}>
          {activeSessions.length} appareils actuellement connectés à vos hotspots.
        </Typography>

        {activeSessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wifi-outline" size={64} color={colors.textSecondary} />
            <Typography variant="h4" style={{ marginTop: 16 }}>Aucune session</Typography>
            <Typography variant="body" color="textSecondary">Tout est calme pour le moment.</Typography>
          </View>
        ) : (
          activeSessions.map((session) => (
            <Card key={session.id} variant="elevated" style={styles.sessionCard}>
              <View style={styles.cardHeader}>
                <View style={styles.deviceInfo}>
                  <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
                    <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />
                  </View>
                  <View>
                    <Typography variant="h4">{session.device_name || 'Appareil'}</Typography>
                    <Typography variant="caption" color="textSecondary">{session.device_mac}</Typography>
                  </View>
                </View>
                <Badge variant="success" label="Actif" />
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Typography variant="caption" color="textSecondary">Début</Typography>
                  <Typography variant="body" style={{ fontWeight: '500' }}>
                    {format.date(session.started_at).split(' ')[1]}
                  </Typography>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.stat}>
                  <Typography variant="caption" color="textSecondary">Hotspot</Typography>
                  <Typography variant="body" style={{ fontWeight: '500' }}>{session.hotspot_name}</Typography>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.stat}>
                  <Typography variant="caption" color="textSecondary">Forfait</Typography>
                  <Typography variant="body" style={{ fontWeight: '500' }}>{session.plan_name}</Typography>
                </View>
              </View>

              <View style={[styles.footer, { borderTopColor: colors.border }]}>
                <TouchableOpacity onPress={() => handleDisconnect(session.id)} style={styles.disconnectBtn}>
                  <Typography variant="button" color="destructive">Déconnecter</Typography>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  subtitle: {
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
  },
  sessionCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: '100%',
  },
  footer: {
    borderTopWidth: 1,
    alignItems: 'center',
  },
  disconnectBtn: {
    padding: 12,
    width: '100%',
    alignItems: 'center',
  },
})
