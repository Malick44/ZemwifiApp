import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, StyleSheet, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Input } from '../../components/ui/Input'
import { Colors } from '../../constants/theme'
import { Button } from '../../src/components/ui/Button'
import { Typography } from '../../src/components/ui/Typography'
import { useAuthStore } from '../../src/stores/authStore'

export default function ProfileScreen() {
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const profile = useAuthStore((s) => s.profile)
  const [name, setName] = useState(profile?.full_name ?? '')
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom')
      return
    }

    await updateProfile({ full_name: name })
    Alert.alert('Succès', 'Profil enregistré')

    // All users land on map view first, then can navigate to role-specific dashboards via tabs
    router.replace('/(app)/(user)/map')
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Typography variant="h1" style={styles.title}>Votre profil</Typography>
        <Typography variant="body" color="textSecondary" style={styles.subtitle}>
          Complétez votre profil pour continuer
        </Typography>

        <View style={styles.form}>
          <Typography variant="label" style={styles.label}>Nom</Typography>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Entrez votre nom complet"
            autoCapitalize="words"
            autoFocus
          />
        </View>

        <Button
          variant="primary"
          size="lg"
          onPress={onSave}
          fullWidth
          disabled={!name.trim()}
        >
          Continuer
        </Button>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  title: {
    marginTop: 20,
  },
  subtitle: {
    marginBottom: 16,
  },
  form: {
    gap: 8,
    flex: 1,
  },
  label: {
    marginBottom: 8,
  },
})
