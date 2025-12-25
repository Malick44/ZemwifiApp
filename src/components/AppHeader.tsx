import { useColors } from '@/hooks/use-colors'
import { useRouter } from 'expo-router'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { t } from '../lib/i18n'

type Props = {
  title: string
  showBack?: boolean
}

export const AppHeader: React.FC<Props> = ({ title, showBack }) => {
  const router = useRouter();
  const colors = useColors();

  return (
    <View style={styles.container}>
      {showBack && (
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.primary }]}>{t('back')}</Text>
        </Pressable>
      )}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
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
  back: {},
  title: { fontSize: 18, fontWeight: '700' },
})
