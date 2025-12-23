import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function ConnectHelp() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aide connexion</Text>
      <Text>1. Sélectionnez un hotspot.</Text>
      <Text>2. Achetez un plan.</Text>
      <Text>3. Connectez-vous via le portail.</Text>
    </View>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24, gap: 8 }, title: { fontSize: 18, fontWeight: '700' } })
