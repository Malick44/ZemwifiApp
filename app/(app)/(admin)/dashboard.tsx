import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Card } from '../../../src/components/ui/Card'
import { Typography } from '../../../src/components/ui/Typography'

export default function AdminDashboard() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
    <ScrollView style={styles.container}>
      <Typography variant="h1" style={styles.title}>Admin Dashboard</Typography>
      <Card>
        <Typography variant="body">Admin features coming soon</Typography>
      </Card>
    </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { marginBottom: 16 },
})
