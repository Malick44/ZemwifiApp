import React from 'react'
import { Text, View, StyleSheet } from 'react-native'

type Props = {
  label: string
  tone?: 'success' | 'info' | 'danger'
}

export const Badge: React.FC<Props> = ({ label, tone = 'info' }) => (
  <View style={[styles.badge, styles[tone]]}>
    <Text style={styles.text}>{label}</Text>
  </View>
)

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: { color: '#fff', fontSize: 12 },
  info: { backgroundColor: '#2563eb' },
  success: { backgroundColor: '#16a34a' },
  danger: { backgroundColor: '#dc2626' },
})
