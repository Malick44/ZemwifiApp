import React, { useState } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { TextField } from '../../src/components/ui/TextField'
import { Button } from '../../src/components/ui/Button'
import { useAuthStore } from '../../src/stores/authStore'
import { AppHeader } from '../../src/components/AppHeader'
import { t } from '../../src/lib/i18n'

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>()
  const [code, setCode] = useState('')
  const verifyOtp = useAuthStore((s) => s.verifyOtp)
  const loading = useAuthStore((s) => s.loading)
  const router = useRouter()

  const onVerify = async () => {
    await verifyOtp(phone ?? '', code)
    Alert.alert('Connecté')
    router.replace('/(app)/(user)/map')
  }

  return (
    <View style={styles.container}>
      <AppHeader title="OTP" showBack />
      <TextField label={t('otp_label')} value={code} onChangeText={setCode} placeholder="000000" />
      <Button label={t('continue')} onPress={onVerify} loading={loading} />
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24, gap: 16 } })
