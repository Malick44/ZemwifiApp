import { Ionicons } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import React, { useCallback, useEffect } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../constants/theme'
import { Badge } from '../../../src/components/ui/Badge'
import { Card } from '../../../src/components/ui/Card'
import { Typography } from '../../../src/components/ui/Typography'
import { useHostHotspotStore } from '../../../src/stores/hostHotspotStore'

export default function HotspotsListScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const styles = createStyles(colors)

  const { hotspots, fetchHostHotspots, loading } = useHostHotspotStore()
  const [refreshing, setRefreshing] = React.useState(false)

  const loadData = useCallback(async () => {
    await fetchHostHotspots()
  }, [fetchHostHotspots])

  useEffect(() => {
    loadData()
  }, [loadData])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  // Calculate some derived stats for display if needed
  // Note: Detailed stats like sales_today would typically come from a joined query
  // For the list view, we might just show basic info or fetch expanded data

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="h3">Mes Hotspots</Typography>
        <Link href="/(app)/(host)/claim" asChild>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </Link>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && !refreshing && hotspots.length === 0 ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : hotspots.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="rose-outline" size={64} color={colors.mutedForeground} />
            <Typography variant="h4" style={{ marginTop: 16 }}>Aucun hotspot</Typography>
            <Typography variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: 8 }}>
              Ajoutez votre premier routeur pour commencer à vendre.
            </Typography>
          </View>
        ) : (
          hotspots.map((hotspot) => (
            <Link key={hotspot.id} href={`/(app)/(host)/hotspot/${hotspot.id}`} asChild>
              <Pressable>
                <Card variant="elevated" style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.iconBox}>
                      <Ionicons name="wifi" size={24} color={hotspot.is_online ? colors.success : colors.mutedForeground} />
                    </View>
                    <View style={styles.headerText}>
                      <Typography variant="h4">{hotspot.name}</Typography>
                      <Typography variant="caption" color="textSecondary">{hotspot.landmark || 'Sans emplacement'}</Typography>
                    </View>
                    <Badge
                      variant={hotspot.is_online ? 'success' : 'neutral'}
                      label={hotspot.is_online ? 'En ligne' : 'Hors ligne'}
                    />
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Typography variant="caption" color="textSecondary">Statut Vente</Typography>
                      <Typography variant="h4" style={{ color: hotspot.sales_paused ? colors.warning : colors.success }}>
                        {hotspot.sales_paused ? 'Pause' : 'Actif'}
                      </Typography>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                      <Typography variant="caption" color="textSecondary">Sessions Actives</Typography>
                      <Typography variant="h4">{hotspot.active_sessions_count || 0}</Typography>
                    </View>
                  </View>

                  <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                    <Typography variant="button" color="primary">Gérer</Typography>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                  </View>
                </Card>
              </Pressable>
            </Link>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
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
  addButton: {
    padding: 8,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    padding: 40,
  },
  card: {
    marginBottom: 16,
    padding: 0, // Reset padding for custom layout
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
    marginRight: 8,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    backgroundColor: colors.backgroundSecondary,
    gap: 4,
  },
})
