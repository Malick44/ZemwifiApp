import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Badge } from '../../../../src/components/ui/Badge'
import { Button } from '../../../../src/components/ui/Button'
import { Card } from '../../../../src/components/ui/Card'
import { EmptyState } from '../../../../src/components/ui/EmptyState'
import { LoadingState } from '../../../../src/components/ui/LoadingState'
import { Typography } from '../../../../src/components/ui/Typography'
import { useDiscoveryStore } from '../../../../src/stores/discoveryStore'

export default function HotspotDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { hotspots, fetchHotspots, plans, fetchPlansForHotspot, loading } = useDiscoveryStore()
  const hotspot = hotspots.find((h) => h.id === id)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']

  useEffect(() => {
    fetchHotspots()
    if (id) fetchPlansForHotspot(id)
  }, [id])

  if (loading && !hotspot) {
    return <LoadingState message="Chargement du hotspot..." />
  }

  if (!hotspot) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          title="Hotspot introuvable"
          message="Ce hotspot n'existe pas ou a été supprimé"
          icon="close-circle"
        />
      </SafeAreaView>
    )
  }

  const hotspotPlans = plans[id!] ?? []
  const selectedPlan = hotspotPlans.find(p => p.id === selectedPlanId)
  const isOnline = hotspot.is_online

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Typography variant="h2" style={styles.headerTitle}>{hotspot.name}</Typography>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hotspot Info Card */}
        <Card variant="elevated" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoMain}>
              <Typography variant="h2">{hotspot.name}</Typography>
              <View style={styles.landmarkRow}>
                <Ionicons name="location" size={16} color={colors.textSecondary} />
                <Typography variant="body" color={colors.textSecondary}>
                  {hotspot.landmark || hotspot.address}
                </Typography>
              </View>
            </View>
            <Badge
              variant={isOnline ? 'success' : 'error'}
              label={isOnline ? 'En ligne' : 'Hors ligne'}
            />
          </View>
        </Card>

        {/* Offline Warning */}
        {!isOnline && (
          <Card variant="filled" style={[styles.warningCard, { backgroundColor: colors.errorBackground }]}>
            <View style={styles.warningRow}>
              <Ionicons name="warning" size={20} color={colors.error} />
              <Typography variant="body" color={colors.error}>
                Ce hotspot est actuellement hors ligne
              </Typography>
            </View>
          </Card>
        )}

        {/* Plans Section */}
        <View style={styles.section}>
          <Typography variant="h2" style={styles.sectionTitle}>Plans disponibles</Typography>

          {hotspotPlans.length === 0 ? (
            <EmptyState
              title="Aucun plan disponible"
              message="Ce hotspot n'a pas de plans actifs pour le moment"
              icon="pricetag-outline"
            />
          ) : (
            hotspotPlans.map((plan) => (
              <Pressable
                key={plan.id}
                onPress={() => setSelectedPlanId(plan.id)}
              >
                <Card
                  variant={selectedPlanId === plan.id ? 'elevated' : 'outlined'}
                  style={[
                    styles.planCard,
                    selectedPlanId === plan.id && { borderColor: colors.tint, borderWidth: 2 }
                  ]}
                >
                  <View style={styles.planContent}>
                    <View style={styles.planInfo}>
                      <Typography variant="h3">{plan.name}</Typography>
                      <View style={styles.planDetails}>
                        <View style={styles.planDetail}>
                          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                          <Typography variant="caption" color={colors.textSecondary}>
                            {formatDuration(plan.duration_s)}
                          </Typography>
                        </View>
                        {(plan.data_cap_bytes || 0) > 0 && (
                          <View style={styles.planDetail}>
                            <Ionicons name="cloud-download-outline" size={16} color={colors.textSecondary} />
                            <Typography variant="caption" color={colors.textSecondary}>
                              {formatData(plan.data_cap_bytes || 0)}
                            </Typography>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.planPrice}>
                      <Typography variant="h2" color={colors.tint}>
                        {plan.price_xof}
                      </Typography>
                      <Typography variant="caption" color={colors.textSecondary}>
                        XOF
                      </Typography>
                    </View>
                  </View>
                  {selectedPlanId === plan.id && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.tint} />
                    </View>
                  )}
                </Card>
              </Pressable>
            ))
          )}
        </View>

        {/* Connection Instructions */}
        <Card variant="outlined" style={styles.instructionsCard}>
          <Typography variant="h3" style={styles.instructionsTitle}>
            Comment se connecter ?
          </Typography>
          <Typography variant="body" color={colors.textSecondary}>
            1. Achetez un plan{'\n'}
            2. Recevez votre code voucher{'\n'}
            3. Connectez-vous au Wi-Fi: {hotspot.name}{'\n'}
            4. Entrez votre code voucher
          </Typography>
          <Link href="/(app)/(user)/connect-help" asChild>
            <Button label="Aide détaillée" variant="ghost" size="sm" />
          </Link>
        </Card>
      </ScrollView>

      {/* Bottom Action Bar */}
      {selectedPlan && isOnline && (
        <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={styles.bottomInfo}>
            <Typography variant="caption" color={colors.textSecondary}>Total</Typography>
            <Typography variant="h2" color={colors.tint}>
              {selectedPlan.price_xof} XOF
            </Typography>
          </View>
          <Link
            href={{
              pathname: '/(app)/(user)/payment/method',
              params: { planId: selectedPlan.id, hotspotId: hotspot.id }
            }}
            asChild
          >
            <Button label="Acheter" style={styles.buyButton} />
          </Link>
        </View>
      )}
    </SafeAreaView>
  )
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h${minutes > 0 ? minutes.toString().padStart(2, '0') : ''}`
  return `${minutes} min`
}

function formatData(bytes: number): string {
  if (bytes === 0) return 'Illimité'
  const gb = bytes / (1024 * 1024 * 1024)
  const mb = bytes / (1024 * 1024)
  if (gb >= 1) return `${gb.toFixed(1)} GB`
  return `${Math.round(mb)} MB`
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    margin: 16,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoMain: {
    flex: 1,
    marginRight: 12,
  },
  landmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  warningCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  planCard: {
    marginBottom: 12,
    position: 'relative',
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planDetails: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  planDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planPrice: {
    alignItems: 'flex-end',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  instructionsCard: {
    margin: 16,
  },
  instructionsTitle: {
    marginBottom: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  bottomInfo: {
    flex: 1,
  },
  buyButton: {
    minWidth: 140,
  },
})
