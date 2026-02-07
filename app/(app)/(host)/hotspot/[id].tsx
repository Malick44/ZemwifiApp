import { Ionicons } from '@expo/vector-icons'
import Slider from '@react-native-community/slider'
import * as Clipboard from 'expo-clipboard'
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, TouchableOpacity, View, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme'
import { Badge } from '../../../../src/components/ui/Badge'
import { Button } from '../../../../src/components/ui/Button'
import { Card } from '../../../../src/components/ui/Card'
import { Typography } from '../../../../src/components/ui/Typography'
import { format } from '../../../../src/lib/format'
import { supabase } from '../../../../src/lib/supabase'
import { useHostHotspotStore } from '../../../../src/stores/hostHotspotStore'
import { RPC } from '@/constants/db'

export default function HostHotspotDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const styles = createStyles(colors)

  const {
    currentHotspot: hotspot,
    currentPlans: plans,
    currentStats: stats,
    fetchHotspotDetails,
    updateHotspotStatus,
    updateHotspotRange,
    toggleSalesPause,
    deletePlan,
    deleteHotspot,
    loading
  } = useHostHotspotStore()

  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'plans' | 'params'>('plans')
  const [range, setRange] = useState(50)
  const [secret, setSecret] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (id) {
      await fetchHotspotDetails(id)
    }
  }, [id, fetchHotspotDetails])

  const handleRevealSecret = async () => {
    try {
      const { data, error } = await supabase.rpc(RPC.REVEAL_HOTSPOT_SECRET, { p_hotspot_id: id })
      if (error) throw error
      setSecret(data)
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de récupérer la clé secrète.')
    }
  }

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (hotspot) {
      setRange(hotspot.range_meters || 50)
    }
  }, [hotspot])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleRangeChange = async (value: number) => {
    if (id) {
      setRange(value)
      // Update logic is handled on sliding complete usually, but here we can just update state first
      // and commit on release if needed, but slider typically updates heavily.
      // useHostHotspotStore handles optimistic updates? No, so we might want to debounce or wait for sliding complete.
    }
  }

  const handleRangeComplete = async (value: number) => {
    if (id) {
      await updateHotspotRange(id, Math.round(value))
    }
  }

  const handleDeleteHotspot = () => {
    Alert.alert(
      "Supprimer le hotspot",
      "Êtes-vous sûr de vouloir supprimer ce hotspot ? Tout l'historique sera définitivement supprimé.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            if (id) {
              try {
                await deleteHotspot(id)
                router.back()
              } catch (_error) {
                Alert.alert("Erreur", "Impossible de supprimer le hotspot")
              }
            }
          }
        }
      ]
    )
  }

  const handleDeletePlan = (planId: string) => {
    Alert.alert(
      "Supprimer le plan",
      "Êtes-vous sûr de vouloir supprimer ce plan ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePlan(planId)
            } catch (_error) {
              Alert.alert("Erreur", "Impossible de supprimer le plan")
            }
          }
        }
      ]
    )
  }

  if (loading && !hotspot && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!hotspot && !loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Typography variant="h4">Hotspot non trouvé</Typography>
        <Button label="Retour" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="h3" style={{ flex: 1, textAlign: 'center' }}>Retour</Typography>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Hotspot Info */}
        <View style={styles.hotspotHeader}>
          <View style={{ flex: 1 }}>
            <Typography variant="h2">{hotspot?.name}</Typography>
            <Typography variant="body" color="textSecondary">{hotspot?.landmark || hotspot?.address || 'Sans emplacement'}</Typography>
          </View>
          <Badge
            variant={hotspot?.is_online ? 'success' : 'neutral'}
            label={hotspot?.is_online ? 'En ligne' : 'Hors ligne'}
          />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card variant="filled" style={[styles.statCard, { backgroundColor: colors.backgroundSecondary }]}>
            <Typography variant="h3" style={{ textAlign: 'center' }}>{stats?.active_sessions || 0}</Typography>
            <Typography variant="caption" color="textSecondary" style={{ textAlign: 'center' }}>Sessions</Typography>
          </Card>
          <Card variant="filled" style={[styles.statCard, { backgroundColor: colors.backgroundSecondary }]}>
            <Typography variant="h3" style={{ textAlign: 'center' }}>{stats?.active_sessions || 0}</Typography>
            <Typography variant="caption" color="textSecondary" style={{ textAlign: 'center' }}>Actifs</Typography>
          </Card>
          <Card variant="filled" style={[styles.statCard, { backgroundColor: colors.backgroundSecondary }]}>
            <Typography variant="h3" style={{ textAlign: 'center' }}>{stats?.sales_today || 0}</Typography>
            <Typography variant="caption" color="textSecondary" style={{ textAlign: 'center' }}>Aujourd&apos;hui</Typography>
          </Card>
        </View>

        {/* Tabs */}
        <View style={[styles.tabContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'plans' && styles.activeTab]}
            onPress={() => setActiveTab('plans')}
          >
            <Typography variant="body" style={{ fontWeight: activeTab === 'plans' ? '700' : '400' }}>Plans</Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'params' && styles.activeTab]}
            onPress={() => setActiveTab('params')}
          >
            <Typography variant="body" style={{ fontWeight: activeTab === 'params' ? '700' : '400' }}>Paramètres</Typography>
          </TouchableOpacity>
        </View>

        {activeTab === 'plans' ? (
          <View style={styles.tabContent}>
            {plans.map((plan) => (
              <Card key={plan.id} variant="outlined" style={styles.planCard}>
                <View style={styles.planContent}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Typography variant="h4">{plan.name}</Typography>
                      {plan.is_active ? (
                        <Badge variant="success" label="Actif" />
                      ) : (
                        <Badge variant="neutral" label="Inactif" />
                      )}
                    </View>
                    <Typography variant="body" color="textSecondary" style={{ marginTop: 4 }}>
                      {format.duration(plan.duration_s)} • {format.dataSize(plan.data_cap_bytes || 0)}
                    </Typography>
                  </View>
                  <Typography variant="h3">{plan.price_xof} XOF</Typography>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.planActions}>
                  <Link href={{ pathname: "/(modal)/plan-editor", params: { hotspotId: id, planId: plan.id } }} asChild>
                    <TouchableOpacity style={styles.actionBtn}>
                      <Ionicons name="create-outline" size={16} color={colors.text} />
                      <Typography variant="body" style={{ fontWeight: '500' }}>Modifier</Typography>
                    </TouchableOpacity>
                  </Link>
                  <TouchableOpacity style={styles.iconActionBtn} onPress={() => handleDeletePlan(plan.id)}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}

            <Link href={{ pathname: "/(modal)/plan-editor", params: { hotspotId: id } }} asChild>
              <Button variant="secondary" label="Ajouter un plan" style={{ marginVertical: 16 }} />
            </Link>

            <Card variant="filled" style={[styles.infoCard, { backgroundColor: colors.infoBackground }]}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Ionicons name="bulb-outline" size={24} color={colors.info} />
                <View style={{ flex: 1 }}>
                  <Typography variant="h4" style={{ marginBottom: 4 }}>Conseils de tarification</Typography>
                  <Typography variant="body" color="textSecondary">Proposez des plans variés pour répondre aux besoins de tous les utilisateurs (courte et longue durée).</Typography>
                </View>
              </View>
            </Card>
          </View>
        ) : (
          <View style={styles.tabContent}>
            <Card variant="outlined" style={styles.sectionCard}>
              <Typography variant="h4" style={styles.cardTitle}>Configuration de base</Typography>

              <View style={styles.controlRow}>
                <View style={{ flex: 1 }}>
                  <Typography variant="body" weight="bold">Statut du Hotspot</Typography>
                  <Typography variant="caption" color="textSecondary">Visible par les utilisateurs</Typography>
                </View>
                <Switch
                  value={!!hotspot?.is_online}
                  onValueChange={(val) => { if (id) updateHotspotStatus(id, val) }}
                  trackColor={{ false: colors.border, true: colors.success }}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.controlRow}>
                <View style={{ flex: 1 }}>
                  <Typography variant="body" weight="bold">Ventes</Typography>
                  <Typography variant="caption" color="textSecondary">Autoriser les achats</Typography>
                </View>
                <Switch
                  value={!hotspot?.sales_paused}
                  onValueChange={() => { if (id) toggleSalesPause(id) }}
                  trackColor={{ false: colors.border, true: colors.success }}
                />
              </View>
            </Card>

            <Card variant="outlined" style={styles.sectionCard}>
              <Typography variant="h4" style={styles.cardTitle}>Configuration du Router</Typography>

              <View style={styles.controlRow}>
                <View style={{ flex: 1 }}>
                  <Typography variant="body" weight="bold">Dernière activité</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {hotspot?.last_seen_at
                      ? new Date(hotspot.last_seen_at).toLocaleString()
                      : 'Jamais connecté'}
                  </Typography>
                </View>
                <Ionicons
                  name="ellipse"
                  size={12}
                  color={hotspot?.is_online ? colors.success : colors.textSecondary}
                />
              </View>

              <View style={[styles.section, { alignItems: 'center', gap: 16 }]}>
                <View style={{ backgroundColor: colors.backgroundSecondary, borderRadius: 12, padding: 20, width: '100%', alignItems: 'center' }}>
                  <Ionicons name="key-outline" size={32} color={colors.primary} style={{ marginBottom: 8 }} />
                  <Typography variant="body" color="textSecondary" style={{ textAlign: 'center', marginBottom: 8 }}>Clé secrète du hotspot</Typography>
                  <Pressable onPress={async () => {
                    if (secret) {
                      await Clipboard.setStringAsync(secret)
                      Alert.alert('Copié', 'Clé secrète copiée !')
                    }
                  }}>
                    <Typography variant="body" style={{ fontSize: 18, textAlign: 'center', fontFamily: 'Courier', letterSpacing: 2 }}>{secret || '••••••••••••'}</Typography>
                  </Pressable>
                </View>

                {!secret ? (
                  <Button variant="tertiary" label="Révéler la clé" onPress={handleRevealSecret} />
                ) : (
                  <Button variant="ghost" label="Masquer" onPress={() => setSecret(null)} />
                )}
              </View>
            </Card>

            <Card variant="outlined" style={styles.sectionCard}>
              <Typography variant="h4" style={styles.cardTitle}>Portée du signal</Typography>
              <Typography variant="body" style={{ marginBottom: 16 }}>
                Rayon de couverture estimé: <Typography variant="body" weight="bold">{range} mètres</Typography>
              </Typography>

              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={10}
                maximumValue={200}
                step={10}
                value={range}
                onValueChange={handleRangeChange}
                onSlidingComplete={handleRangeComplete}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Typography variant="caption" color="textSecondary">10m</Typography>
                <Typography variant="caption" color="textSecondary">200m</Typography>
              </View>
            </Card>

            <Card variant="outlined" style={[styles.sectionCard, { borderColor: colors.error }]}>
              <Typography variant="h4" color="error" style={styles.cardTitle}>Zone de danger</Typography>
              <Button
                variant="ghost"
                label="Supprimer ce hotspot"
                style={{ alignSelf: 'flex-start', paddingLeft: 0 }}
                onPress={handleDeleteHotspot}
              >
                <Typography variant="button" color="error">Supprimer ce hotspot</Typography>
              </Button>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginLeft: -8,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  hotspotHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  tabContent: {
    gap: 16,
  },
  planCard: {
    padding: 16,
    borderRadius: 12,
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  divider: {
    height: 1,
    borderBottomWidth: 1,
  },
  section: {
    paddingVertical: 16,
    gap: 16
  },
  planActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
  },
  iconActionBtn: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 0,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 12,
  },
  cardTitle: {
    marginBottom: 16,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
})
