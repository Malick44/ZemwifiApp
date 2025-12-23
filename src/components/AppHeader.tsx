import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { t } from '../lib/i18n'

type Props = {
  title: string
  showBack?: boolean
}

export const AppHeader: React.FC<Props> = ({ title, showBack }) => {
  const router = useRouter()
  return (
    <View style={styles.container}>
      {showBack && (
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>{t('back')}</Text>
        </Pressable>
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  back: { color: '#2563eb' },
  title: { fontSize: 18, fontWeight: '700' },
})
