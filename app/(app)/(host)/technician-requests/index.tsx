import { Ionicons } from '@expo/vector-icons'
import { Link, Stack, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme'
import { Badge } from '../../../../src/components/ui/Badge'
import { Card } from '../../../../src/components/ui/Card'
import { Typography } from '../../../../src/components/ui/Typography'

// Mock Data
const MOCK_REQUESTS = [
  { id: '1', title: 'Routeur hors ligne', hotspot: 'Cyber Café Central', status: 'pending', priority: 'high', date: '2025-12-20' },
  { id: '2', title: 'Problème de configuration', hotspot: 'Maibangué Wi-Fi', status: 'in_progress', priority: 'medium', date: '2025-12-18' },
  { id: '3', title: 'Installation antenne', hotspot: 'Boutique Zogona', status: 'completed', priority: 'low', date: '2025-12-10' },
]

export default function TechnicianRequestsList() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const insets = useSafeAreaInsets()
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'in_progress': return 'primary'
      case 'completed': return 'success'
      default: return 'neutral'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'in_progress': return 'En cours'
      case 'completed': return 'Terminé'
      default: return status
    }
  }

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
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Filter Tabs */}
        <View style={styles.tabs}>
          {['all', 'active', 'completed'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f as any)}
              style={[
                styles.tab,
                filter === f && { backgroundColor: colors.secondary, borderColor: colors.primary, borderWidth: 1 }
              ]}
            >
              <Typography variant="caption" style={{ fontWeight: filter === f ? 'bold' : 'normal', color: filter === f ? colors.primary : colors.textSecondary }}>
                {f === 'all' ? 'Tous' : f === 'active' ? 'En cours' : 'Terminés'}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>

        {MOCK_REQUESTS.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="build-outline" size={64} color={colors.mutedForeground} />
            <Typography variant="h4" style={{ marginTop: 16 }}>Aucune demande d&apos;intervention</Typography>
            <Typography variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: 8 }}>
              Vous n&apos;avez pas encore fait de demande. d&apos;assistance technique.
            </Typography>
          </View>
        ) : (
          MOCK_REQUESTS.map((req) => (
            <Link key={req.id} href={`/(app)/(host)/technician-requests/${req.id}`} asChild>
              <Pressable>
                <Card variant="outlined" style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Typography variant="h4" style={styles.cardTitle}>{req.title}</Typography>
                    <Badge variant={getStatusColor(req.status) as any}>
                      {getStatusLabel(req.status)}
                    </Badge>
                  </View>

                  <Typography variant="body" color="textSecondary" style={{ marginBottom: 8 }}>
                    {req.hotspot}
                  </Typography>

                  <View style={styles.cardFooter}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                      <Typography variant="caption" color="textSecondary">{req.date}</Typography>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="flag-outline" size={14} color={colors.textSecondary} />
                      <Typography variant="caption" color="textSecondary">Priorité {req.priority}</Typography>
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
