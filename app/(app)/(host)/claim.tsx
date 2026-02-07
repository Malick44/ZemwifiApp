import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../constants/theme'
import { Button } from '../../../src/components/ui/Button'
import { TextField } from '../../../src/components/ui/TextField'
import { Typography } from '../../../src/components/ui/Typography'

export default function ClaimRouterScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const styles = createStyles(colors)
  const [serialNumber, setSerialNumber] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClaim = () => {
    if (serialNumber.length < 5) {
      Alert.alert('Erreur', 'Numéro de série invalide')
      return
    }

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      Alert.alert(
        'Succès',
        'Routeur identifié avec succès ! Passons à la configuration.',
        [
          { text: 'Continuer', onPress: () => router.push('/(app)/(host)/setup') }
        ]
      )
    }, 1500)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="h3">Ajouter un routeur</Typography>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="rose-outline" size={48} color={colors.textInverse} />
        </View>

        <Typography variant="h2" style={styles.title}>Numéro de série</Typography>
        <Typography variant="body" color="textSecondary" style={styles.subtitle}>
          Entrez le numéro de série situé au dos de votre équipement ZemNet ou scannez le code-barres.
        </Typography>

        <View style={styles.inputContainer}>
          <TextField
            label="Numéro de série (S/N)"
            placeholder="Ex: ZN-2025-XXXX"
            value={serialNumber}
            onChangeText={setSerialNumber}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.scanButton}>
            <Ionicons name="barcode-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.helpContainer}>
          <Ionicons name="information-circle-outline" size={20} color={colors.mutedForeground} />
          <Typography variant="caption" color="textSecondary" style={styles.helpText}>
            Le numéro de série est une suite de chiffres et lettres sous le code-barres.
          </Typography>
        </View>

        <View style={styles.spacer} />

        <Button
          size="lg"
          fullWidth
          onPress={handleClaim}
          loading={loading}
          disabled={!serialNumber}
        >
          Vérifier et ajouter
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
  content: {
    flex: 1,
    padding: 24,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 32,
    marginTop: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  scanButton: {
    position: 'absolute',
    right: 12,
    top: 34, // Adjust based on label height
    padding: 4,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
  },
  helpText: {
    flex: 1,
    marginLeft: 8,
  },
  spacer: {
    flex: 1,
  },
})
