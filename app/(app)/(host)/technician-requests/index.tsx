import { Ionicons } from '@expo/vector-icons'
import { Link, Stack, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme'
import { Badge } from '../../../../src/components/ui/Badge'
import { Card } from '../../../../src/components/ui/Card'
import { NotificationBadge } from '../../../../src/components/ui/NotificationBadge'
import { Typography } from '../../../../src/components/ui/Typography'
import { useNotificationStore } from '../../../../src/stores/notificationStore'
import { useTechnicianRequestStore } from '../../../../src/stores/technicianRequestStore'

export default function TechnicianRequestsList() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const insets = useSafeAreaInsets()
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  const { requests, loading, fetchRequests, refresh } = useTechnicianRequestStore()
  const { unreadCount, fetchNotifications } = useNotificationStore()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchRequests()
    fetchNotifications()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'assigned': return 'info'
      case 'accepted': return 'primary'
      case 'in_progress': return 'primary'
      case 'completed': return 'success'
      case 'cancelled': return 'neutral'
      case 'rejected': return 'error'
      default: return 'neutral'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'assigned': return 'Assigné'
      case 'accepted': return 'Accepté'
      case 'in_progress': return 'En cours'
      case 'completed': return 'Terminé'
      case 'cancelled': return 'Annulé'
      case 'rejected': return 'Rejeté'
      default: return status
    }
  }

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true
    if (filter === 'active') {
      return ['pending', 'assigned', 'accepted', 'in_progress'].includes(req.status)
    }
    return req.status === 'completed'
  })

  const activeCount = requests.filter(r =>
    ['pending', 'assigned', 'accepted', 'in_progress'].includes(r.status)
  ).length

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="h3">Support Technique</Typography>
        <Link href="/(app)/(host)/technician-requests/new" asChild>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </Link>
        <Link href="/(app)/(shared)/notifications" asChild>
          <TouchableOpacity style={styles.addButton}>
            <View>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              <NotificationBadge count={unreadCount} size={16} />
            </View>
          </TouchableOpacity>
        </Link>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >

        {/* Filter Tabs */}
        <View style={styles.tabs}>
          {[
            { key: 'all', label: 'Tous' },
            { key: 'active', label: `En cours (${activeCount})` },
            { key: 'completed', label: 'Terminés' }
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key as any)}
              style={[
                styles.tab,
                filter === f.key && { backgroundColor: colors.secondary, borderColor: colors.primary, borderWidth: 1 }
              ]}
            >
              <Typography variant="caption" style={{ fontWeight: filter === f.key ? 'bold' : 'normal', color: filter === f.key ? colors.primary : colors.textSecondary }}>
                {f.label}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>

        {loading && requests.length === 0 ? (
          <View style={styles.emptyState}>
            <Typography variant="body" color="textSecondary">Chargement...</Typography>
          </View>
        ) : filteredRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="build-outline" size={64} color={colors.mutedForeground} />
            <Typography variant="h4" style={{ marginTop: 16 }}>Aucune demande d&apos;intervention</Typography>
            <Typography variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: 8 }}>
              Vous n&apos;avez pas encore fait de demande d&apos;assistance technique.
            </Typography>
          </View>
        ) : (
          filteredRequests.map((req) => (
            <Link key={req.id} href={`/(app)/(host)/technician-requests/${req.id}`} asChild>
              <Pressable>
                <Card variant="outlined" style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Typography variant="h4" style={styles.cardTitle}>{req.subject}</Typography>
                    <Badge variant={getStatusColor(req.status) as any}>
                      {getStatusLabel(req.status)}
                    </Badge>
                  </View>

                  <Typography variant="body" color="textSecondary" style={{ marginBottom: 8 }}>
                    {req.hotspot_name || 'Hotspot'}
                  </Typography>

                  {req.technician_name && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
                      <Typography variant="caption" color="textSecondary">
                        {req.technician_name}
                      </Typography>
                    </View>
                  )}

                  <View style={styles.cardFooter}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                      <Typography variant="caption" color="textSecondary">
                        {new Date(req.created_at).toLocaleDateString('fr-FR')}
                      </Typography>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="flag-outline" size={14} color={colors.textSecondary} />
                      <Typography variant="caption" color="textSecondary">
                        Priorité {req.priority}
                      </Typography>
                    </View>
                  </View>
                </Card>
              </Pressable>
            </Link>
          ))
        )}
      </ScrollView>
    </View>
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
  addButton: {
    padding: 8,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    padding: 40,
  },
  card: {
    marginBottom: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    marginRight: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
})
