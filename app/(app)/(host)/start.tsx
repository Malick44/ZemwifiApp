import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function HostStart() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Devenir hôte</Text>
      <Text>Inscrivez votre hotspot et gagnez.</Text>
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24 }, title: { fontSize: 18, fontWeight: '700' } })
