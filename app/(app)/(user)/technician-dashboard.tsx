import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '../../../constants/theme'
import { ActionButton } from '../../../src/components/ui/ActionButton'
import { Badge } from '../../../src/components/ui/Badge'
import { Card } from '../../../src/components/ui/Card'
import { Typography } from '../../../src/components/ui/Typography'

// Mock Data
const MOCK_TASKS = [
  { id: '1', title: 'Routeur hors ligne', hotspot: 'Cyber Café Central', host: 'Ibrahim Kaboré', phone: '+226 70 00 00 00', status: 'assigned', priority: 'high', date: '2025-12-20' },
  { id: '2', title: 'Configuration impossible', hotspot: 'Maibangué Wi-Fi', host: 'Fatou Sow', phone: '+226 76 00 00 00', status: 'assigned', priority: 'medium', date: '2025-12-22' },
  { id: '3', title: 'Antenne déplacée', hotspot: 'Boutique Zogona', host: 'Ali Ouedraogo', phone: '+226 78 00 00 00', status: 'completed', priority: 'low', date: '2025-12-18' },
]

export default function TechnicianDashboard() {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'assigned' | 'completed'>('assigned')
  const [isOnline, setIsOnline] = useState(true)

  const filteredTasks = MOCK_TASKS.filter(task => activeTab === 'assigned' ? task.status === 'assigned' : task.status === 'completed')

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/(app)/(user)/map')}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Typography variant="h2">Mes Interventions</Typography>
          <Typography variant="body" color="textSecondary">Bonjour, Moussa</Typography>
        </View>
        <TouchableOpacity
          style={[styles.statusToggle, { backgroundColor: isOnline ? colors.success + '20' : colors.textTertiary + '20' }]}
          onPress={() => setIsOnline(!isOnline)}
        >
          <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.success : colors.textSecondary }]} />
          <Typography variant="caption" style={{ fontWeight: '600', color: isOnline ? colors.success : colors.textSecondary }}>
            {isOnline ? 'DISPONIBLE' : 'OCCUPÉ'}
          </Typography>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card variant="filled" style={styles.statCard}>
            <Typography variant="h2" color="primary">2</Typography>
            <Typography variant="caption" color="textSecondary">En attente</Typography>
          </Card>
          <Card variant="filled" style={styles.statCard}>
            <Typography variant="h2" color="success">5</Typography>
            <Typography variant="caption" color="textSecondary">Terminé auj.</Typography>
          </Card>
          <Card variant="filled" style={styles.statCard}>
            <View style={styles.ratingContainer}>
              <Typography variant="h2" color="warning">4.8</Typography>
              <Ionicons name="star" size={16} color={colors.warning} />
            </View>
            <Typography variant="caption" color="textSecondary">Note moy.</Typography>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <ActionButton
            label="Nouvelle intervention"
            icon="add-circle"
            variant="primary"
            size="md"
            onPress={() => { }}
            style={{ flex: 1 }}
          />
          <ActionButton
            label="Scanner QR"
            icon="qr-code-outline"
            variant="glass"
            size="md"
            onPress={() => { }}
            style={{ flex: 1 }}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'assigned' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab('assigned')}
          >
            <Typography variant="body" style={{ fontWeight: activeTab === 'assigned' ? 'bold' : 'normal', color: activeTab === 'assigned' ? colors.primary : colors.textSecondary }}>
              À faire (2)
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab('completed')}
          >
            <Typography variant="body" style={{ fontWeight: activeTab === 'completed' ? 'bold' : 'normal', color: activeTab === 'completed' ? colors.primary : colors.textSecondary }}>
              Terminé
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Task List */}
        <View style={styles.taskList}>
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={64} color={colors.textSecondary} />
              <Typography variant="body" color="textSecondary" style={{ marginTop: 16 }}>Aucune tâche pour le moment</Typography>
            </View>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.id} variant="outlined" style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Badge
                    label={task.priority === 'high' ? 'URGENT' : task.priority === 'medium' ? 'MOYEN' : 'BAS'}
                    variant={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'neutral'}
                  />
                  <Typography variant="caption" color="textSecondary">#{task.id} • {task.date}</Typography>
                </View>

                <Typography variant="h4" style={styles.taskTitle}>{task.title}</Typography>
                <Typography variant="body" style={{ marginBottom: 4 }}>{task.hotspot}</Typography>

                <View style={styles.hostInfo}>
                  <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
                  <Typography variant="caption" color="textSecondary">{task.host}</Typography>
                  <View style={styles.dot} />
                  <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
                  <Typography variant="caption" color="textSecondary">{task.phone}</Typography>
                </View>

                <View style={styles.actions}>
                  <ActionButton
                    label="Détails"
                    icon="information-circle-outline"
                    variant="secondary"
                    size="sm"
                    onPress={() => { }}
                    style={{ flex: 1 }}
                  />
                  {activeTab === 'assigned' ? (
                    <>
                      <ActionButton
                        label="Appeler"
                        icon="call"
                        variant="glass"
                        size="sm"
                        onPress={() => { }}
                        style={{ flex: 1 }}
                      />
                      <ActionButton
                        label="Démarrer"
                        icon="play-circle"
                        variant="success"
                        size="sm"
                        onPress={() => { }}
                        style={{ flex: 1 }}
                      />
                    </>
                  ) : (
                    <ActionButton
                      label="Voir rapport"
                      icon="document-text-outline"
                      variant="glass"
                      size="sm"
                      onPress={() => { }}
                      style={{ flex: 1 }}
                    />
                  )}
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <ActionButton
          label="Nouvelle intervention"
          icon="add"
          variant="primary"
          size="lg"
          onPress={() => { }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
  },
  taskList: {
    gap: 16,
  },
  taskCard: {
    padding: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    marginBottom: 4,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 16,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
})
