import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function TechnicianDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Technicien</Text>
      <Text>Voir les interventions assignées.</Text>
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24 }, title: { fontSize: 18, fontWeight: '700' } })
