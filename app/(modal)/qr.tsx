import { Colors } from '@/constants/theme'
import { useColors } from '@/hooks/use-colors'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { useTranslation } from '../../src/lib/i18n'

export default function QrModal() {
  const { code, title } = useLocalSearchParams<{ code?: string; title?: string }>()
  const { t } = useTranslation()
  const colors = useColors()
  const styles = createStyles(colors)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title || t('voucher_qr')}</Text>
      {code ? (
        <View style={styles.qrWrapper}>
          <QRCode value={code} size={220} />
        </View>
      ) : (
        <Text style={styles.error}>No code provided</Text>
      )}
      <Text style={styles.code}>{code}</Text>
    </View>
  )
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  qrWrapper: {
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  code: { fontSize: 16, fontWeight: '600', marginTop: 12, letterSpacing: 2, color: colors.text },
  error: { fontSize: 14, color: colors.error }
})
