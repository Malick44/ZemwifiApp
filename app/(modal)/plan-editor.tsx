import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function PlanEditorModal() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Éditeur de plan</Text>
      <Text>Créer ou modifier un plan hotspot.</Text>
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24 }, title: { fontSize: 18, fontWeight: '700' } })
