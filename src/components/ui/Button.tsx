import React from 'react'
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native'

type Props = {
  label: string
  onPress?: () => void
  disabled?: boolean
  loading?: boolean
}

export const Button: React.FC<Props> = ({ label, onPress, disabled, loading }) => {
  return (
    <Pressable 
      style={[styles.button, (disabled || loading) && styles.disabled]} 
      onPress={onPress} 
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? <ActivityIndicator color="#fff" accessibilityLabel="Loading" /> : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  label: { color: '#fff', fontWeight: '600' },
  disabled: { opacity: 0.6 },
})
