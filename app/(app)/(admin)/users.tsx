import React from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Card } from '../../../src/components/ui/Card'
import { Typography } from '../../../src/components/ui/Typography'

export default function AdminUsers() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
    <View style={styles.container}>
      <Typography variant="h1">Utilisateurs</Typography>
      <Card>
        <Typography variant="body">User management coming soon</Typography>
      </Card>
    </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
})
