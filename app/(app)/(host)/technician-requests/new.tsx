import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme'
import { Button } from '../../../../src/components/ui/Button'
import { TextField } from '../../../../src/components/ui/TextField'
import { Typography } from '../../../../src/components/ui/Typography'

export default function NewTechnicianRequestScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    hotspot: '',
    description: '',
  })

  const handleSubmit = () => {
    if (!formData.subject || !formData.description) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      Alert.alert(
        'Demande envoyée',
        'Un technicien prendra en charge votre demande sous peu.',
        [{ text: 'OK', onPress: () => router.back() }]
      )
    }, 1500)
  }

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
          <TouchableOpacity style={[styles.uploadBox, { borderColor: colors.border }]}>
            <Ionicons name="camera-outline" size={32} color={colors.textSecondary} />
            <Typography variant="caption" color="textSecondary" style={{ marginTop: 8 }}>Ajouter une photo</Typography>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Button
          fullWidth
          size="lg"
          onPress={handleSubmit}
          loading={loading}
        >
          Envoyer la demande
        </Button>
      </View>
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
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
  },
})
