import { Colors } from '@/constants/theme'
import { useColors } from '@/hooks/use-colors'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from '../../src/lib/i18n'

export default function VoucherCodeModal() {
  const { code, title } = useLocalSearchParams<{ code?: string; title?: string }>()
  const { t } = useTranslation()
  const colors = useColors()
  const styles = createStyles(colors)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!code) return
    await Clipboard.setStringAsync(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title || t('voucher_code')}</Text>
      {code ? (
        <View style={styles.codeWrapper}>
          <Text style={[styles.code, { color: colors.primary }]}>{code}</Text>
          <Pressable onPress={handleCopy} style={styles.copyButton} hitSlop={8}>
            <Ionicons
              name={copied ? 'checkmark-circle' : 'copy-outline'}
              size={22}
              color={copied ? colors.success : colors.textSecondary}
            />
          </Pressable>
        </View>
      ) : (
        <Text style={styles.error}>No code provided</Text>
      )}
      <Text style={styles.hint}>
        {copied ? 'Copié !' : 'Appuyez sur l\'icône pour copier le code'}
      </Text>
    </View>
  )
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  codeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  code: { fontSize: 22, fontWeight: '700', letterSpacing: 3 },
  copyButton: { padding: 4 },
  hint: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  error: { fontSize: 14, color: colors.error },
})
