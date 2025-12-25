import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../constants/theme'
import { Card } from '../../../src/components/ui/Card'
import { Typography } from '../../../src/components/ui/Typography'

export default function EarningsScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const [period, setPeriod] = useState<'week' | 'month'>('week')

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="h3">Revenus Détaillés</Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Period Selector */}
        <View style={[styles.periodSelector, { backgroundColor: colors.secondary }]}>
          <TouchableOpacity
            style={[styles.periodBtn, period === 'week' && { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }]}
            onPress={() => setPeriod('week')}
          >
            <Typography variant="caption" style={{ fontWeight: period === 'week' ? 'bold' : 'normal' }}>Cette semaine</Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodBtn, period === 'month' && { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }]}
            onPress={() => setPeriod('month')}
          >
            <Typography variant="caption" style={{ fontWeight: period === 'month' ? 'bold' : 'normal' }}>Ce mois</Typography>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.summaryGrid}>
          <Card variant="outlined" style={styles.summaryItem}>
            <Typography variant="caption" color="textSecondary">Ventes Totales</Typography>
            <Typography variant="h3" color="primary">45 000 F</Typography>
          </Card>
          <Card variant="outlined" style={styles.summaryItem}>
            <Typography variant="caption" color="textSecondary">Net perçu</Typography>
            <Typography variant="h3" color="success">40 500 F</Typography>
          </Card>
        </View>

        {/* Chart Placeholder */}
        <Card variant="elevated" style={styles.chartCard}>
          <Typography variant="h4" style={{ marginBottom: 16 }}>Évolution des ventes</Typography>
          <View style={styles.chartPlaceholder}>
            {/* Simple Bar Chart Visualization using Views */}
            {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
              <View key={i} style={styles.barContainer}>
                <View style={[styles.bar, { height: `${h}%`, backgroundColor: colors.primary }]} />
                <Typography variant="caption" style={{ fontSize: 10, marginTop: 4 }}>J{i + 1}</Typography>
              </View>
            ))}
          </View>
        </Card>

        {/* Recent Transactions List */}
        <Typography variant="h4" style={styles.sectionTitle}>Dernières transactions</Typography>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={[styles.transactionRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.txIcon, { backgroundColor: colors.secondary }]}>
              <Ionicons name="cart-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.txInfo}>
              <Typography variant="body" style={{ fontWeight: '500' }}>Forfait 1h - Cyber Café</Typography>
              <Typography variant="caption" color="textSecondary">Aujourd&apos;hui</Typography>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Typography variant="body" style={{ fontWeight: '600' }}>+500 F</Typography>
              <Typography variant="caption" color="success">Succès</Typography>
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginBottom: 24,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryItem: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  chartCard: {
    padding: 20,
    marginBottom: 32,
  },
  chartPlaceholder: {
    height: 150,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  barContainer: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    width: 20,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
})
