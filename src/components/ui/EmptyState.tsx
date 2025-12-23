import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Button } from './Button'

type Props = {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState: React.FC<Props> = ({ title, description, actionLabel, onAction }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {description && <Text style={styles.description}>{description}</Text>}
    {actionLabel && <Button label={actionLabel} onPress={onAction} />}
  </View>
)

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  description: { color: '#6b7280', textAlign: 'center', marginBottom: 12 },
})
