import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme'
import { BottomSheet } from '../../../../src/components/ui/BottomSheet'
import { Button } from '../../../../src/components/ui/Button'
import { TextField } from '../../../../src/components/ui/TextField'
import { Typography } from '../../../../src/components/ui/Typography'
import { mediaUploader } from '../../../../src/lib/mediaUploader'
import { useAuthStore } from '../../../../src/stores/authStore'
import { RequestPriority, useTechnicianRequestStore } from '../../../../src/stores/technicianRequestStore'
import { Technician, useTechnicianStore } from '../../../../src/stores/technicianStore'

export default function NewTechnicianRequestScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const { createRequest, loading, assignTechnician } = useTechnicianRequestStore()
  const { technicians, fetchAvailableTechnicians, loading: techLoading } = useTechnicianStore()

  const [formData, setFormData] = useState({
    subject: '',
    hotspot: 'hotspot-1', // Should be selected from host's hotspots
    description: '',
    priority: 'medium' as RequestPriority,
    technician_id: '', // Optional - host can choose or leave empty for auto-assignment
  })
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [showTechnicianPicker, setShowTechnicianPicker] = useState(false)
  const [recentTechnicians, setRecentTechnicians] = useState<Technician[]>([])
  const profile = useAuthStore((s) => s.profile)

  const RECENT_TECHNICIANS_KEY = '@recent_technicians'

  useEffect(() => {
    fetchAvailableTechnicians()
    loadRecentTechnicians()
  }, [])

  const loadRecentTechnicians = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_TECHNICIANS_KEY)
      if (stored) {
        const techIds: string[] = JSON.parse(stored)
        // Filter technicians that are still available
        const recent = technicians.filter(t => techIds.includes(t.id))
        setRecentTechnicians(recent)
      }
    } catch (error) {
      console.error('Failed to load recent technicians:', error)
    }
  }

  const saveRecentTechnician = async (technicianId: string) => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_TECHNICIANS_KEY)
      let techIds: string[] = stored ? JSON.parse(stored) : []

      // Remove if already exists
      techIds = techIds.filter(id => id !== technicianId)

      // Add to front
      techIds.unshift(technicianId)

      // Keep only last 2
      techIds = techIds.slice(0, 2)

      await AsyncStorage.setItem(RECENT_TECHNICIANS_KEY, JSON.stringify(techIds))

      // Update state
      const recent = technicians.filter(t => techIds.includes(t.id))
      setRecentTechnicians(recent)
    } catch (error) {
      console.error('Failed to save recent technician:', error)
    }
  }

  const handleSelectTechnician = (technician: Technician) => {
    setFormData({ ...formData, technician_id: technician.id })
    saveRecentTechnician(technician.id)
    setShowTechnicianPicker(false)
  }

  const handleClearTechnician = () => {
    setFormData({ ...formData, technician_id: '' })
  }

  const handlePickImage = () => {
    setShowImagePicker(true)
  }

  const handlePickFromCamera = async () => {
    setShowImagePicker(false)
    const image = await mediaUploader.pickImageFromCamera()
    if (image) setPhotoUri(image.uri)
  }

  const handlePickFromGallery = async () => {
    setShowImagePicker(false)
    const image = await mediaUploader.pickImageFromGallery()
    if (image) setPhotoUri(image.uri)
  }

  const handleRemovePhoto = () => {
    setPhotoUri(null)
  }

  const handleSubmit = async () => {
    if (!formData.subject || !formData.description) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      let photoUrl: string | undefined

      // Upload photo if selected
      if (photoUri && profile?.id) {
        setUploading(true)
        const uploadResult = await mediaUploader.uploadImage(
          photoUri,
          profile.id,
          `req_${Date.now()}`
        )
        setUploading(false)

        if (uploadResult.error) {
          Alert.alert('Attention', 'La photo n\'a pas pu être téléchargée, mais la demande sera créée.')
        } else {
          photoUrl = uploadResult.url
        }
      }

      const request = await createRequest({
        hotspot_id: formData.hotspot,
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority,
        photo_url: photoUrl,
      })

      // If host selected a specific technician, assign them
      if (formData.technician_id) {
        await assignTechnician(request.id, formData.technician_id)
      }

      Alert.alert(
        'Demande envoyée',
        formData.technician_id
          ? 'Le technicien sélectionné a été notifié.'
          : 'Un technicien prendra en charge votre demande sous peu.',
        [{ text: 'OK', onPress: () => router.push(`/(app)/(host)/technician-requests/${request.id}`) }]
      )
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la demande. Veuillez réessayer.')
    }
  }

  const priorities: { value: RequestPriority; label: string; color: string }[] = [
    { value: 'low', label: 'Basse', color: colors.textSecondary },
    { value: 'medium', label: 'Moyenne', color: colors.warning },
    { value: 'high', label: 'Haute', color: colors.error },
  ]

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="h3">Nouvelle demande</Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.formGroup}>
          <TextField
            label="Sujet"
            placeholder="Ex: Routeur ne s'allume plus"
            value={formData.subject}
            onChangeText={(t) => setFormData({ ...formData, subject: t })}
          />
        </View>

        <View style={styles.formGroup}>
          <Typography variant="label" style={{ marginBottom: 8 }}>Hotspot concerné</Typography>
          {/* Mock Dropdown Trigger */}
          <TouchableOpacity style={[styles.dropdown, { borderColor: colors.border }]}>
            <Typography variant="body">{formData.hotspot || 'Sélectionner un hotspot'}</Typography>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Typography variant="label" style={{ marginBottom: 8 }}>Priorité</Typography>
          <View style={styles.priorityContainer}>
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority.value}
                style={[
                  styles.priorityButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: formData.priority === priority.value ? priority.color + '20' : 'transparent'
                  },
                  formData.priority === priority.value && {
                    borderColor: priority.color,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => setFormData({ ...formData, priority: priority.value })}
              >
                <Typography
                  variant="body"
                  style={{
                    fontWeight: formData.priority === priority.value ? '600' : '400',
                    color: formData.priority === priority.value ? priority.color : colors.text
                  }}
                >
                  {priority.label}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Typography variant="label" style={{ marginBottom: 8 }}>
            Technicien (Optionnel)
          </Typography>
          <Typography variant="caption" color="textSecondary" style={{ marginBottom: 8 }}>
            Laissez vide pour assignation automatique
          </Typography>
          <TouchableOpacity
            style={[styles.dropdown, { borderColor: colors.border }]}
            onPress={() => setShowTechnicianPicker(true)}
          >
            <View style={{ flex: 1 }}>
              {formData.technician_id ? (
                <View>
                  <Typography variant="body">
                    {technicians.find(t => t.id === formData.technician_id)?.name || 'Technicien sélectionné'}
                  </Typography>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Ionicons name="star" size={12} color={colors.warning} />
                    <Typography variant="caption" color="textSecondary">
                      {technicians.find(t => t.id === formData.technician_id)?.rating || '4.8'}
                    </Typography>
                  </View>
                </View>
              ) : (
                <Typography variant="body" color="textSecondary">
                  {techLoading ? 'Chargement...' : `${technicians.length} techniciens disponibles`}
                </Typography>
              )}
            </View>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Show selected technician with clear button */}
          {formData.technician_id && (
            <TouchableOpacity
              style={[styles.clearTechnicianButton, { borderColor: colors.border }]}
              onPress={handleClearTechnician}
            >
              <Ionicons name="close-circle" size={18} color={colors.error} />
              <Typography variant="caption" color="error" style={{ marginLeft: 6 }}>
                Retirer la sélection
              </Typography>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.formGroup}>
          <TextField
            label="Description détaillée"
            placeholder="Décrivez le problème rencontré..."
            value={formData.description}
            onChangeText={(t) => setFormData({ ...formData, description: t })}
            multiline
            numberOfLines={5}
            style={{ height: 120, textAlignVertical: 'top' }}
          />
        </View>

        <View style={styles.formGroup}>
          <Typography variant="label" style={{ marginBottom: 8 }}>Photo (Optionnel)</Typography>
          {photoUri ? (
            <View>
              <View style={[styles.photoPreview, { borderColor: colors.border }]}>
                <Image source={{ uri: photoUri }} style={styles.photoImage} />
                <TouchableOpacity
                  style={[styles.removePhotoButton, { backgroundColor: colors.error }]}
                  onPress={handleRemovePhoto}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.changePhotoButton, { borderColor: colors.border }]}
                onPress={handlePickImage}
              >
                <Ionicons name="camera-outline" size={20} color={colors.primary} />
                <Typography variant="body" color="primary" style={{ marginLeft: 8 }}>
                  Changer la photo
                </Typography>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.uploadBox, { borderColor: colors.border }]}
              onPress={handlePickImage}
            >
              <Ionicons name="camera-outline" size={32} color={colors.textSecondary} />
              <Typography variant="caption" color="textSecondary" style={{ marginTop: 8 }}>
                Ajouter une photo
              </Typography>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Button
          fullWidth
          size="lg"
          onPress={handleSubmit}
          loading={loading || uploading}
          disabled={loading || uploading}
        >
          {uploading ? 'Téléchargement...' : 'Envoyer la demande'}
        </Button>
      </View>

      {/* Image Picker Bottom Sheet */}
      <BottomSheet
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        title="Ajouter une photo"
        snapPoint={0.35}
      >
        <View style={styles.imagePickerOptions}>
          <TouchableOpacity
            style={[styles.imagePickerOption, { borderColor: colors.border }]}
            onPress={handlePickFromCamera}
          >
            <View style={[styles.imagePickerIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="camera" size={28} color={colors.primary} />
            </View>
            <View style={styles.imagePickerTextContainer}>
              <Typography variant="body" style={{ fontWeight: '600' }}>
                Prendre une photo
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Utiliser l&apos;appareil photo
              </Typography>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.imagePickerOption, { borderColor: colors.border }]}
            onPress={handlePickFromGallery}
          >
            <View style={[styles.imagePickerIconContainer, { backgroundColor: colors.secondary + '15' }]}>
              <Ionicons name="images" size={28} color={colors.primary} />
            </View>
            <View style={styles.imagePickerTextContainer}>
              <Typography variant="body" style={{ fontWeight: '600' }}>
                Choisir de la galerie
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Sélectionner une photo existante
              </Typography>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Technician Picker Bottom Sheet */}
      <BottomSheet
        visible={showTechnicianPicker}
        onClose={() => setShowTechnicianPicker(false)}
        title="Choisir un technicien"
        snapPoint={0.7}
      >
        <ScrollView style={styles.technicianPickerContent}>
          {/* Recent Technicians Section */}
          {recentTechnicians.length > 0 && (
            <View style={styles.recentSection}>
              <Typography variant="label" style={{ marginBottom: 12 }}>
                Récemment sélectionnés
              </Typography>
              {recentTechnicians.map((tech) => (
                <TouchableOpacity
                  key={tech.id}
                  style={[
                    styles.technicianPickerCard,
                    {
                      borderColor: colors.border,
                      backgroundColor: formData.technician_id === tech.id ? colors.secondary : 'transparent'
                    }
                  ]}
                  onPress={() => handleSelectTechnician(tech)}
                >
                  <View style={styles.technicianInfo}>
                    <View style={[styles.technicianAvatar, { backgroundColor: colors.primary + '20' }]}>
                      <Typography variant="body" color="primary" style={{ fontWeight: '600' }}>
                        {tech.name.split(' ').map(n => n[0]).join('')}
                      </Typography>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Typography variant="body" style={{ fontWeight: '600' }}>
                        {tech.name}
                      </Typography>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                          <Ionicons name="star" size={12} color={colors.warning} />
                          <Typography variant="caption" color="textSecondary">
                            {tech.rating}
                          </Typography>
                        </View>
                        <Typography variant="caption" color="textSecondary">•</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {tech.completed_jobs} interventions
                        </Typography>
                      </View>
                    </View>
                    {formData.technician_id === tech.id && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* All Available Technicians */}
          <View style={styles.allTechniciansSection}>
            <Typography variant="label" style={{ marginBottom: 12 }}>
              Tous les techniciens disponibles ({technicians.length})
            </Typography>
            {technicians.map((tech) => (
              <TouchableOpacity
                key={tech.id}
                style={[
                  styles.technicianPickerCard,
                  {
                    borderColor: colors.border,
                    backgroundColor: formData.technician_id === tech.id ? colors.secondary : 'transparent'
                  }
                ]}
                onPress={() => handleSelectTechnician(tech)}
              >
                <View style={styles.technicianInfo}>
                  <View style={[styles.technicianAvatar, { backgroundColor: colors.primary + '20' }]}>
                    <Typography variant="body" color="primary" style={{ fontWeight: '600' }}>
                      {tech.name.split(' ').map(n => n[0]).join('')}
                    </Typography>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Typography variant="body" style={{ fontWeight: '600' }}>
                      {tech.name}
                    </Typography>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <Ionicons name="star" size={12} color={colors.warning} />
                        <Typography variant="caption" color="textSecondary">
                          {tech.rating}
                        </Typography>
                      </View>
                      <Typography variant="caption" color="textSecondary">•</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {tech.completed_jobs} interventions
                      </Typography>
                      {tech.is_available && (
                        <>
                          <Typography variant="caption" color="textSecondary">•</Typography>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <View style={[styles.availableDot, { backgroundColor: colors.success }]} />
                            <Typography variant="caption" color="success">Disponible</Typography>
                          </View>
                        </>
                      )}
                    </View>
                  </View>
                  {formData.technician_id === tech.id && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </BottomSheet>
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
    padding: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  techniciansList: {
    marginTop: 12,
    gap: 8,
  },
  technicianCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  technicianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  technicianAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  photoPreview: {
    borderWidth: 1,
    borderRadius: 12,
    height: 200,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  imagePickerOptions: {
    gap: 12,
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  imagePickerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerTextContainer: {
    flex: 1,
  },
  clearTechnicianButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  technicianPickerContent: {
    padding: 20,
  },
  recentSection: {
    marginBottom: 24,
  },
  allTechniciansSection: {
    marginBottom: 20,
  },
  technicianPickerCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
  },
})
