import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native'
import { Colors } from '../../constants/theme'
import { Card } from '../../src/components/ui/Card'
import { Typography } from '../../src/components/ui/Typography'
import { format } from '../../src/lib/format'
import { useHostHotspotStore } from '../../src/stores/hostHotspotStore'
import { PlanFormData, PlanTemplate } from '../../src/types/domain'

// Predefined Templates
const PLAN_TEMPLATES: PlanTemplate[] = [
  { id: 'quick', name: 'Accès Rapide', description: 'Idéal pour consulter ses messages', duration_seconds: 1800, data_bytes: 524288000, suggested_price_xof: 100 },
  { id: 'standard', name: 'Standard', description: '1 Heure de navigation', duration_seconds: 3600, data_bytes: 1073741824, suggested_price_xof: 200 },
  { id: 'daily', name: 'Journée', description: '24 Heures complètes', duration_seconds: 86400, data_bytes: 5368709120, suggested_price_xof: 1000 },
  { id: 'work', name: 'Travail', description: 'Gros volume pour travailler', duration_seconds: 14400, data_bytes: 10737418240, suggested_price_xof: 2500 }
]

const UNLIMITED_BYTES = 1024 * 1024 * 1024 * 1024 * 1024 // 1 PB

export default function PlanEditorModal() {
  const router = useRouter()
  const { hotspotId, planId } = useLocalSearchParams<{ hotspotId: string, planId?: string }>()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const styles = createStyles(colors)

  const { createPlan, updatePlan, currentPlans, loading } = useHostHotspotStore()

  // Form State
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    duration_seconds: 3600,
    data_bytes: 1024 * 1024 * 1024 * 1024 * 1024, // Unlimited by default (1 PB)
    price_xof: 0,
    is_active: true
  })

  const [customDuration, setCustomDuration] = useState('1')
  const [durationUnit, setDurationUnit] = useState<'hours' | 'days'>('hours')
  const [customData, setCustomData] = useState('1')
  const [dataUnit, setDataUnit] = useState<'GB' | 'MB'>('GB')
  const [isUnlimited, setIsUnlimited] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  // Load existing plan if editing
  useEffect(() => {
    if (planId && currentPlans.length > 0) {
      const plan = currentPlans.find(p => p.id === planId)
      if (plan) {
        setFormData({
          name: plan.name,
          duration_seconds: plan.duration_seconds,
          data_bytes: plan.data_bytes,
          price_xof: plan.price_xof,
          is_active: plan.is_active
        })
        setIsEditing(true)

        // Reverse engineer duration/data for inputs
        if (plan.duration_seconds >= 86400 && plan.duration_seconds % 86400 === 0) {
          setDurationUnit('days')
          setCustomDuration((plan.duration_seconds / 86400).toString())
        } else {
          setDurationUnit('hours')
          setCustomDuration((plan.duration_seconds / 3600).toFixed(1).replace(/\.0$/, ''))
        }

        if (plan.data_bytes >= 1024 * 1024 * 1024 * 1024 * 100) {
          setIsUnlimited(true)
          setDataUnit('GB')
          setCustomData('1')
        } else {
          setIsUnlimited(false)
          if (plan.data_bytes >= 1073741824) {
            setDataUnit('GB')
            setCustomData((plan.data_bytes / 1073741824).toFixed(1).replace(/\.0$/, ''))
          } else {
            setDataUnit('MB')
            setCustomData((plan.data_bytes / 1048576).toFixed(0))
          }
        }
      }
    }
  }, [planId, currentPlans])

  // Apply template
  const applyTemplate = (template: PlanTemplate) => {
    setFormData({
      ...formData,
      name: template.name,
      duration_seconds: template.duration_seconds,
      data_bytes: template.data_bytes,
      price_xof: template.suggested_price_xof
    })

    // Update inputs
    if (template.duration_seconds >= 86400 && template.duration_seconds % 86400 === 0) {
      setDurationUnit('days')
      setCustomDuration((template.duration_seconds / 86400).toString())
    } else {
      setDurationUnit('hours')
      setCustomDuration((template.duration_seconds / 3600).toString())
    }

    if (template.data_bytes >= 1024 * 1024 * 1024 * 1024 * 100) {
      setIsUnlimited(true)
      setDataUnit('GB')
      setCustomData('1')
    } else {
      setIsUnlimited(false)
      if (template.data_bytes >= 1073741824) {
        setDataUnit('GB')
        setCustomData((template.data_bytes / 1073741824).toString())
      } else {
        setDataUnit('MB')
        setCustomData((template.data_bytes / 1048576).toString())
      }
    }
  }

  // Handle Save
  const handleSave = async () => {
    if (!formData.name || !formData.price_xof) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      // Recalculate exact values from inputs before saving (to handle manual edits)
      const durationMult = durationUnit === 'days' ? 86400 : 3600
      let finalDataBytes = 0
      if (isUnlimited) {
        finalDataBytes = UNLIMITED_BYTES
      } else {
        const dataMult = dataUnit === 'GB' ? 1073741824 : 1048576
        finalDataBytes = parseFloat(customData) * dataMult
      }

      const finalData: PlanFormData = {
        ...formData,
        duration_seconds: parseFloat(customDuration) * durationMult,
        data_bytes: finalDataBytes
      }

      if (isEditing && planId) {
        await updatePlan(planId, finalData)
      } else {
        if (!hotspotId) return
        await createPlan(hotspotId, finalData)
      }
      router.back()
    } catch (_error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde')
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Typography variant="body" color="primary">Annuler</Typography>
        </TouchableOpacity>
        <Typography variant="h3">{isEditing ? 'Modifier le plan' : 'Nouveau plan'}</Typography>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Typography variant="body" color="primary" style={{ fontWeight: '600' }}>Enregistrer</Typography>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>

          {/* Templates - Only show when creating new */}
          {!isEditing && (
            <View style={styles.section}>
              <Typography variant="h4" style={styles.sectionTitle}>Modèles rapides</Typography>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templatesRow}>
                {PLAN_TEMPLATES.map((tpl) => (
                  <TouchableOpacity key={tpl.id} onPress={() => applyTemplate(tpl)}>
                    <Card style={[styles.templateCard, { borderColor: formData.name === tpl.name ? colors.primary : 'transparent', borderWidth: 2 }]}>
                      <Typography variant="h4">{tpl.name}</Typography>
                      <Typography variant="caption" color="textSecondary">{format.duration(tpl.duration_seconds)}</Typography>
                      <Typography variant="caption" color="textSecondary">{format.dataSize(tpl.data_bytes)}</Typography>
                      <Typography variant="h4" color="primary" style={{ marginTop: 4 }}>{tpl.suggested_price_xof} F</Typography>
                    </Card>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.section}>
            <Typography variant="h4" style={styles.sectionTitle}>Détails du plan</Typography>

            <View style={styles.inputGroup}>
              <Typography variant="caption" style={styles.label}>Nom du plan</Typography>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Ex: Forfait Journée"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <View style={styles.inputGroup}>
              <Typography variant="caption" style={styles.label}>Prix (XOF)</Typography>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                value={formData.price_xof.toString()}
                onChangeText={(text) => setFormData({ ...formData, price_xof: parseInt(text) || 0 })}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Typography variant="h4" style={styles.sectionTitle}>Limites</Typography>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Typography variant="caption" style={styles.label}>Durée</Typography>
                <View style={styles.unitInput}>
                  <TextInput
                    style={[styles.input, { flex: 1, color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                    value={customDuration}
                    onChangeText={setCustomDuration}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={[styles.unitToggle, { backgroundColor: colors.secondary }]}
                    onPress={() => setDurationUnit(durationUnit === 'hours' ? 'days' : 'hours')}
                  >
                    <Typography variant="caption">{durationUnit === 'hours' ? 'Heures' : 'Jours'}</Typography>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Typography variant="caption" style={{ fontWeight: '600' }}>Data</Typography>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Typography variant="caption" style={{ fontSize: 10 }}>Illimité</Typography>
                      <Switch
                        value={isUnlimited}
                        onValueChange={setIsUnlimited}
                        style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                      />
                    </View>
                  </View>
                  {isUnlimited ? (
                    <View style={[styles.input, { backgroundColor: colors.backgroundSecondary, justifyContent: 'center', alignItems: 'center' }]}>
                      <Typography variant="body" color="textSecondary">Illimité</Typography>
                    </View>
                  ) : (
                    <View style={styles.unitInput}>
                      <TextInput
                        style={[styles.input, { flex: 1, color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                        value={customData}
                        onChangeText={setCustomData}
                        keyboardType="numeric"
                        editable={!isUnlimited}
                      />
                      <TouchableOpacity
                        style={[styles.unitToggle, { backgroundColor: colors.secondary }]}
                        onPress={() => setDataUnit(dataUnit === 'GB' ? 'MB' : 'GB')}
                      >
                        <Typography variant="caption">{dataUnit}</Typography>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.switchRow}>
              <Typography variant="h4">Plan Actif</Typography>
              <Switch
                value={formData.is_active}
                onValueChange={(val) => setFormData({ ...formData, is_active: val })}
                trackColor={{ false: colors.border, true: colors.success }}
              />
            </View>
            <Typography variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
              Si désactivé, ce plan ne sera pas visible pour les utilisateurs.
            </Typography>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  templatesRow: {
    gap: 12,
    paddingRight: 20,
  },
  templateCard: {
    width: 140,
    padding: 12,
    gap: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  unitInput: {
    flexDirection: 'row',
    gap: 8,
  },
  unitToggle: {
    width: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})
