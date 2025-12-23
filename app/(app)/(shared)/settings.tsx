import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function Settings() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Réglages</Text>
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24 }, title: { fontSize: 18, fontWeight: '700' } })
