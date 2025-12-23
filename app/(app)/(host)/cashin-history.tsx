import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function HostCashinHistory() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique cash-in</Text>
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24 }, title: { fontSize: 18, fontWeight: '700' } })
