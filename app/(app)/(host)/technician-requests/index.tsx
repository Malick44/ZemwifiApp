import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function TechnicianRequests() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demandes technicien</Text>
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24 }, title: { fontSize: 18, fontWeight: '700' } })
