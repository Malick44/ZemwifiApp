import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../constants/theme'
import { Button } from '../../../src/components/ui/Button'
import { TextField } from '../../../src/components/ui/TextField'
import { Typography } from '../../../src/components/ui/Typography'

export default function KYCScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const styles = createStyles(colors)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    address: '',
  })
  const [loading, setLoading] = useState(false)

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.idNumber || !formData.address) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs')
        return
      }
      setStep(2)
    } else {
      submitKYC()
    }
  }

  const submitKYC = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      Alert.alert(
        'Succès',
        'Votre dossier a été soumis avec succès. Nous vous contacterons bientôt.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(app)/(host)/dashboard'),
          },
        ]
      )
    }, 1500)
  }

  const UploadPlaceholder = ({ label }: { label: string }) => (
    <TouchableOpacity style={[styles.uploadBox, { borderColor: colors.border }]}>
      <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
      <Typography variant="h4" style={{ marginBottom: 4 }}>Carte d&apos;identité (Recto)</Typography>
      <Typography variant="caption" color="textSecondary">De la pièce d&apos;identité</Typography>
    </TouchableOpacity>
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
                label="Numéro CNIB / Passport"
                placeholder="BXXXXXXX"
                value={formData.idNumber}
                onChangeText={(t) => setFormData({ ...formData, idNumber: t })}
              />
              <View style={styles.spacer} />
              <TextField
                label="Adresse de résidence"
                placeholder="Quartier, Secteur, Ville"
                value={formData.address}
                onChangeText={(t) => setFormData({ ...formData, address: t })}
              />
            </View>
          </View>
        ) : (
          <View style={styles.formSection}>
            <Typography variant="h2" style={styles.title}>Documents</Typography>
            <Typography variant="body" color="textSecondary" style={styles.subtitle}>
              Veuillez télécharger une photo claire de votre pièce d&apos;identité et un selfie.
            </Typography>

            <View style={styles.uploadGroup}>
              <Typography variant="label" style={styles.inputLabel}>Photo recto de la pièce d&apos;identité</Typography>
              <UploadPlaceholder label="Recto CNIB/Passport" />

              <View style={styles.spacer} />

              <Typography variant="label" style={styles.inputLabel}>Selfie avec la pièce d&apos;identité</Typography>
              <UploadPlaceholder label="Prendre un selfie" />
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
