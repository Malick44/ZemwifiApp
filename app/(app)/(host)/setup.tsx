import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../constants/theme'
import { Button } from '../../../src/components/ui/Button'
import { TextField } from '../../../src/components/ui/TextField'
import { Typography } from '../../../src/components/ui/Typography'

export default function HotspotSetupScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ssid: '',
    password: '',
  })

  const handleFinish = () => {
    if (!formData.name) {
      Alert.alert('Erreur', 'Le nom du hotspot est requis')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      Alert.alert(
        'Configuration terminée !',
        'Votre hotspot est maintenant prêt et visible sur la carte.',
        [
          { text: 'Aller au tableau de bord', onPress: () => router.replace('/(app)/(host)/dashboard') }
        ]
      )
    }, 1500)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="h3">Configuration du Hotspot</Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Typography variant="body" color="textSecondary" style={styles.subtitle}>
          Personnalisez votre point d'accès pour que les utilisateurs puissent le trouver facilement.
        </Typography>

        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>Informations générales</Typography>
          <View style={styles.inputGroup}>
            <TextField
              label="Nom du Hotspot"
              placeholder="Ex: Cyber Café Central"
              value={formData.name}
              onChangeText={(t) => setFormData({ ...formData, name: t })}
            />
            <TextField
              label="Description / Point de repère"
              placeholder="Ex: Face à la pharmacie, portail bleu"
              value={formData.description}
              onChangeText={(t) => setFormData({ ...formData, description: t })}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>Localisation</Typography>
          <TouchableOpacity style={[styles.mapPlaceholder, { borderColor: colors.border }]}>
            <Ionicons name="map-outline" size={32} color={colors.primary} />
            <Typography variant="body" style={{ marginTop: 8 }}>Définir la position sur la carte</Typography>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>Configuration Wi-Fi</Typography>
          <View style={styles.inputGroup}>
            <TextField
              label="Nom du réseau (SSID)"
              placeholder="ZemNet_XXXX"
              value={formData.ssid}
              onChangeText={(t) => setFormData({ ...formData, ssid: t })}
            />
            <TextField
              label="Mot de passe (optionnel)"
              placeholder="Laisser vide si ouvert"
              value={formData.password}
              onChangeText={(t) => setFormData({ ...formData, password: t })}
              secureTextEntry
            />
          </View>
        </View>

        <Button
          size="large"
          fullWidth
          onPress={handleFinish}
          loading={loading}
          style={styles.submitBtn}
        >
          Terminer la configuration
        </Button>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 8,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  subtitle: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  inputGroup: {
    gap: 16,
  },
  mapPlaceholder: {
    height: 150,
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  submitBtn: {
    marginTop: 16,
  },
})
