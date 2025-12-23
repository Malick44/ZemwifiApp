import React, { useState } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { Button } from '../../src/components/ui/Button'
import { TextField } from '../../src/components/ui/TextField'
import { useAuthStore } from '../../src/stores/authStore'
import { AppHeader } from '../../src/components/AppHeader'
import { t } from '../../src/lib/i18n'

export default function PhoneScreen() {
  const [phone, setPhone] = useState('')
  const sendOtp = useAuthStore((s) => s.sendOtp)
  const loading = useAuthStore((s) => s.loading)
  const router = useRouter()

  const onSubmit = async () => {
    await sendOtp(phone)
    Alert.alert('Code envoyé')
    router.push({ pathname: '/(auth)/otp', params: { phone } })
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Connexion" showBack />
      <TextField label={t('phone_label')} value={phone} onChangeText={setPhone} placeholder="+225..." />
      <Button label={t('continue')} onPress={onSubmit} loading={loading} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16 },
})
