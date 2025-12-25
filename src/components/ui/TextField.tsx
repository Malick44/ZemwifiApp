import { useColors } from '@/hooks/use-colors'
import React from 'react'
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native'

interface Props extends TextInputProps {
  label?: string
}

export const TextField: React.FC<Props> = ({ label, style, ...props }) => {
  const colors = useColors();

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        placeholderTextColor={colors.textTertiary}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
})
