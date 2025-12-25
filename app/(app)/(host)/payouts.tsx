import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../constants/theme'
import { Button } from '../../../src/components/ui/Button'
import { Card } from '../../../src/components/ui/Card'
import { TextField } from '../../../src/components/ui/TextField'
import { Typography } from '../../../src/components/ui/Typography'
import { format } from '../../../src/lib/format'

const MOCK_PAYOUTS = [
  { id: '1', amount: 25000, status: 'completed', date: '2025-12-15T10:00:00Z', method: 'Orange Money' },
  { id: '2', amount: 10000, status: 'pending', date: '2025-12-20T14:30:00Z', method: 'Moov Money' },
]

export default function PayoutsScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const [balance, setBalance] = useState(45500)
  const [requestAmount, setRequestAmount] = useState('')
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRequest = () => {
    if (!requestAmount || Number(requestAmount) > balance) {
      Alert.alert('Erreur', 'Montant invalide ou solde insuffisant')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setShowRequestForm(false)
      Alert.alert('Succès', 'Demande de retrait envoyée !')
      setBalance(b => b - Number(requestAmount))
      setRequestAmount('')
    }, 1000)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="h3">Mes Retraits</Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Balance Card */}
        <Card variant="elevated" style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <Typography variant="body" style={{ color: 'rgba(255,255,255,0.8)' }}>Solde disponible</Typography>
          <Typography variant="h1" style={{ color: 'white', fontSize: 36, marginVertical: 8 }}>
            {format.currency(balance)}
          </Typography>
          {showRequestForm ? (
            <View style={styles.requestForm}>
              <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 4 }}>
                <TextField
                  placeholder="Montant à retirer"
                  value={requestAmount}
                  onChangeText={setRequestAmount}
                  keyboardType="numeric"
                  style={{ color: 'black' }}
                />
              </View>
              <View style={styles.formActions}>
                <Button size="sm" variant="secondary" onPress={() => setRequestAmount('1000')}>1000</Button>
                <Button size="sm" variant="secondary" onPress={() => setRequestAmount('2000')}>2000</Button>
                <Button size="sm" variant="ghost" onPress={() => setShowRequestForm(false)}>Annuler</Button>
                <Button size="sm" variant="primary" onPress={handleRequest} loading={loading}>Confirmer</Button>
              </View>
            </View>
          ) : (
            <Button
              onPress={() => setShowRequestForm(true)}
              variant="secondary"
              style={{ alignSelf: 'flex-start', marginTop: 8 }}
            >
              Demander un retrait
            </Button>
          )}
        </Card>

        <Typography variant="h4" style={styles.sectionTitle}>Historique</Typography>

        {MOCK_PAYOUTS.length === 0 ? (
          <View style={styles.emptyState}>
            <Typography variant="body" color="textSecondary">Aucun retrait pour le moment.</Typography>
          </View>
        ) : (
          MOCK_PAYOUTS.map((payout) => (
            <Card key={payout.id} variant="outlined" style={styles.payoutItem}>
              <View style={styles.payoutIcon}>
                <Ionicons
                  name={payout.status === 'completed' ? 'checkmark-circle' : 'time'}
                  size={24}
                  color={payout.status === 'completed' ? colors.success : colors.warning}
                />
              </View>
              <View style={styles.payoutInfo}>
                <Typography variant="h4">{format.currency(payout.amount)}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {format.date(payout.date)} • {payout.method}
                </Typography>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: payout.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)' }]}>
                <Typography variant="caption" style={{ color: payout.status === 'completed' ? colors.success : colors.warning, textTransform: 'uppercase', fontWeight: 'bold', fontSize: 10 }}>
                  {payout.status === 'completed' ? 'Payé' : 'En attente'}
                </Typography>
              </View>
            </Card>
          ))
        )}

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
    padding: 24,
  },
  balanceCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 32,
  },
  requestForm: {
    marginTop: 16,
    gap: 12,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  payoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 16,
  },
  payoutIcon: {
    marginRight: 16,
  },
  payoutInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
})
