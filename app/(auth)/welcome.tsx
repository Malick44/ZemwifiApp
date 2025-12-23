import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Link } from 'expo-router'
import { Button } from '../../src/components/ui/Button'
import { useAuthStore } from '../../src/stores/authStore'
import { t } from '../../src/lib/i18n'

export default function WelcomeScreen() {
  const setLanguage = useAuthStore((s) => s.setLanguage)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('welcome_title')}</Text>
      <View style={styles.languages}>
        <Button label="Français" onPress={() => setLanguage('fr')} />
        <Button label="English" onPress={() => setLanguage('en')} />
      </View>
      <Link href="/(auth)/phone" asChild>
        <Button label={t('continue')} />
      </Link>
      <Link href="/(app)/(app)/map" style={styles.guest}>
        <Text>Continuer en invité</Text>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: 16, padding: 24 },
  title: { fontSize: 24, fontWeight: '700' },
  languages: { flexDirection: 'row', gap: 12 },
  guest: { alignSelf: 'center' },
})
