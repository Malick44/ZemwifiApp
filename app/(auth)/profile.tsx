import React, { useState } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { TextField } from '../../src/components/ui/TextField'
import { Button } from '../../src/components/ui/Button'
import { useAuthStore } from '../../src/stores/authStore'
import { AppHeader } from '../../src/components/AppHeader'
import { t } from '../../src/lib/i18n'

export default function ProfileScreen() {
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const profile = useAuthStore((s) => s.profile)
  const [name, setName] = useState(profile?.full_name ?? '')
  const router = useRouter()

  const onSave = async () => {
    await updateProfile({ full_name: name })
    Alert.alert('Profil enregistré')
    router.replace('/(app)/(user)/map')
  }

  return (
    <View style={styles.container}>
      <AppHeader title={t('profile_title')} showBack />
      <TextField label="Nom" value={name} onChangeText={setName} />
      <Button label={t('continue')} onPress={onSave} />
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24, gap: 16 } })
