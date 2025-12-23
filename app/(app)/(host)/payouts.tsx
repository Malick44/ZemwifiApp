import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function HostPayouts() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demandes de retrait</Text>
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24 }, title: { fontSize: 18, fontWeight: '700' } })
