import React from 'react'
import { TextInput, StyleSheet, View, Text } from 'react-native'

type Props = {
  label?: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  secureTextEntry?: boolean
}

export const TextField: React.FC<Props> = ({ label, value, onChangeText, placeholder, secureTextEntry }) => (
  <View style={styles.container}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
    />
  </View>
)

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { marginBottom: 4, color: '#111' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
  },
})
