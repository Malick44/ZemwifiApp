import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function About() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>À propos</Text>
      <Text>ZemNet version mobile.</Text>
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24 }, title: { fontSize: 18, fontWeight: '700' } })
