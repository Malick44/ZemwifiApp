import { Ionicons } from '@expo/vector-icons'
import { decode } from 'base64-arraybuffer'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../constants/theme'
import { Button } from '../../../src/components/ui/Button'
import { TextField } from '../../../src/components/ui/TextField'
import { Typography } from '../../../src/components/ui/Typography'
import { supabase } from '../../../src/lib/supabase'
import { useAuthStore } from '../../../src/stores/authStore'
import { COLUMNS, ENUMS, TABLES } from '@/constants/db'

export default function KYCScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const styles = createStyles(colors)
  const profile = useAuthStore((s) => s.profile)

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: profile?.name || '',
    idNumber: '',
    address: '',
    businessName: '', // Optional, can store in address or separate metadata if needed, but schema doesn't have it explicitly. Let's keep it in state but maybe redundant for now.
  })

  const [idImage, setIdImage] = useState<ImagePicker.ImagePickerAsset | null>(null)
  const [selfieImage, setSelfieImage] = useState<ImagePicker.ImagePickerAsset | null>(null)

  const [loading, setLoading] = useState(false)

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.idNumber || !formData.address) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires')
        return
      }
      setStep(2)
    } else {
      submitKYC()
    }
  }

  const pickImage = async (type: 'id' | 'selfie') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    })

    if (!result.canceled) {
      if (type === 'id') setIdImage(result.assets[0])
      else setSelfieImage(result.assets[0])
    }
  }

  const uploadFile = async (asset: ImagePicker.ImagePickerAsset, userId: string): Promise<string> => {
    if (!asset.base64) throw new Error('Image data missing')

    const fileExt = asset.uri.split('.').pop()
    const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('kyc-documents') // Hyphen matched to migration
      .upload(fileName, decode(asset.base64), {
        contentType: asset.mimeType || 'image/jpeg',
        upsert: true
      })

    if (uploadError) throw uploadError

    // With private bucket, we store the path. 
    // The admin dashboard can generate a signed URL using this path.
    return fileName
  }

  const submitKYC = async () => {
    if (!idImage) {
      Alert.alert('Erreur', 'Veuillez télécharger une photo de votre pièce d\'identité')
      return
    }
    if (!selfieImage) {
      Alert.alert('Erreur', 'Veuillez télécharger un selfie avec votre pièce d\'identité')
      return
    }

    setLoading(true)
    try {
      const userId = useAuthStore.getState().session?.user.id
      if (!userId) throw new Error('Utilisateur non connecté')

      // 1. Upload Images
      const idCardPath = await uploadFile(idImage, userId)
      const selfiePath = await uploadFile(selfieImage, userId)

      // 2. Insert Submission
    const { error: insertError } = await supabase
        .from(TABLES.KYC_SUBMISSIONS)
        .insert({
          [COLUMNS.KYC_SUBMISSIONS.USER_ID]: userId,
          [COLUMNS.KYC_SUBMISSIONS.FULL_NAME]: formData.fullName,
          [COLUMNS.KYC_SUBMISSIONS.ID_NUMBER]: formData.idNumber,
          [COLUMNS.KYC_SUBMISSIONS.ADDRESS]: formData.address, // Added address
          [COLUMNS.KYC_SUBMISSIONS.ID_CARD_URL]: idCardPath,
          [COLUMNS.KYC_SUBMISSIONS.SELFIE_URL]: selfiePath,
          [COLUMNS.KYC_SUBMISSIONS.STATUS]: ENUMS.KYC_STATUS.PENDING
        })

      if (insertError) throw insertError

      Alert.alert(
        'Succès',
        'Votre dossier a été soumis avec succès. Un administrateur va l\'examiner.',
        [{ text: 'OK', onPress: () => router.replace('/(app)/(host)/dashboard') }]
      )

    } catch (error: any) {
      console.error('KYC Error:', error)
      Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de la soumission')
    } finally {
      setLoading(false)
    }
  }

  const UploadPlaceholder = ({ label, image, onPress }: { label: string, image?: ImagePicker.ImagePickerAsset | null, onPress?: () => void }) => (
    <View>
      <Typography variant="label" style={styles.inputLabel}>{label}</Typography>

      {image && (
        <View style={{ height: 200, marginBottom: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
          <Image source={{ uri: image.uri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        </View>
      )}

      <TouchableOpacity onPress={onPress} style={[styles.uploadBox, { borderColor: image ? colors.success : colors.border }]}>
        {image ? (
          <Ionicons name="checkmark-circle" size={32} color={colors.success} />
        ) : (
          <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
        )}
        <Typography variant="h4" style={{ marginBottom: 4, marginTop: 8 }}>{image ? 'Changer l\'image' : 'Sélectionner'}</Typography>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 1 ? router.back() : setStep(1)} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="h3">Vérification d&apos;identité</Typography>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: step === 1 ? '50%' : '100%', backgroundColor: colors.primary }]} />
        </View>
        <Typography variant="caption" style={styles.stepText}>Étape {step} sur 2</Typography>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 1 ? (
          <View style={styles.formSection}>
            <Typography variant="h2" style={styles.title}>Informations personnelles</Typography>
            <Typography variant="body" color="textSecondary" style={styles.subtitle}>
              Nous avons besoin de vérifier votre identité conformément à la réglementation.
            </Typography>

            <View style={styles.inputGroup}>
              <TextField
                label="Nom complet"
                placeholder="Entrez votre nom complet"
                value={formData.fullName}
                onChangeText={(t) => setFormData({ ...formData, fullName: t })}
              />
              <View style={styles.spacer} />
              <TextField
                label="Adresse de résidence"
                placeholder="Quartier, Secteur, Ville"
                value={formData.address}
                onChangeText={(t) => setFormData({ ...formData, address: t })}
              />
              <View style={styles.spacer} />
              <TextField
                label="Numéro CNIB / Passport"
                placeholder="BXXXXXXX"
                value={formData.idNumber}
                onChangeText={(t) => setFormData({ ...formData, idNumber: t })}
              />
            </View>
          </View>
        ) : (
          <View style={styles.formSection}>
            <Typography variant="h2" style={styles.title}>Documents</Typography>
            <Typography variant="body" color="textSecondary" style={styles.subtitle}>
              Veuillez télécharger une photo claire de votre pièce d&apos;identité et un selfie avec celle-ci.
            </Typography>

            <View style={styles.uploadGroup}>
              <UploadPlaceholder
                label="Photo recto de la pièce d'identité"
                image={idImage}
                onPress={() => pickImage('id')}
              />

              <View style={styles.spacer} />

              <UploadPlaceholder
                label="Selfie avec la pièce d'identité"
                image={selfieImage}
                onPress={() => pickImage('selfie')}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Button
          size="lg"
          fullWidth
          onPress={handleNext}
          loading={loading}
          disabled={loading}
        >
          {step === 1 ? 'Continuer' : 'Soumettre le dossier'}
        </Button>
      </View>
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
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepText: {
    textAlign: 'right',
  },
  content: {
    padding: 24,
  },
  formSection: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
  },
  inputGroup: {
    gap: 4,
  },
  spacer: {
    height: 16,
  },
  uploadGroup: {
    gap: 4,
  },
  inputLabel: {
    marginBottom: 8,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  uploadLabel: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
  },
})
