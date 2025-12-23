import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function HostDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tableau de bord hôte</Text>
      <Text>Suivez vos ventes et sessions.</Text>
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24 }, title: { fontSize: 18, fontWeight: '700' } })
