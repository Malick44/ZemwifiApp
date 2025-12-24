import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../constants/theme'
import { Button } from '../../../src/components/ui/Button'
import { Card } from '../../../src/components/ui/Card'
import { TextField } from '../../../src/components/ui/TextField'
import { Typography } from '../../../src/components/ui/Typography'
import { format } from '../../../src/lib/format'

export default function CashInScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const [userId, setUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Scan/Enter ID, 2: Amount & Confirm

  const handleScan = () => {
    // Simulate scan
    setUserId('USER-12345')
    setStep(2)
  }

  const handleConfirm = () => {
    if (!amount) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      Alert.alert('Succès', `Recharge de ${format.currency(Number(amount))} effectuée avec succès !`, [
        { text: 'OK', onPress: () => router.back() }
      ])
    }, 1500)
  }

  const commission = Number(amount) * 0.02

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 1 ? router.back() : setStep(1)} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="h3">Recharger un client</Typography>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {step === 1 ? (
          <>
            <View style={styles.scannerPlaceholder}>
              <Ionicons name="scan-outline" size={64} color="white" />
              <Typography variant="body" style={{ color: 'white', marginTop: 16 }}>
                Scanner le QR Code du client
              </Typography>
              <Button style={{ marginTop: 24, backgroundColor: 'white' }} textStyle={{ color: 'black' }} onPress={handleScan}>
                Simuler Scan
              </Button>
            </View>

            <View style={styles.manualEntry}>
              <Typography variant="h4" style={{ marginBottom: 16 }}>Ou entrer l'ID manuellement</Typography>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <TextField
                    placeholder="ID Client"
                    value={userId}
                    onChangeText={setUserId}
                  />
                </View>
                <Button onPress={() => { if (userId) setStep(2) }}>OK</Button>
              </View>
            </View>
          </>
        ) : (
          <View style={{ flex: 1 }}>
            <Card variant="outlined" style={styles.customerCard}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color={colors.primary} />
              </View>
              <View>
                <Typography variant="h4">Client #{userId}</Typography>
                <Typography variant="caption" color="textSecondary">Compte vérifié</Typography>
              </View>
            </Card>

            <Typography variant="label" style={styles.label}>Montant à recharger</Typography>
            <TextField
              placeholder="Ex: 5000"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              style={{ fontSize: 24, fontWeight: 'bold' }}
            />

            {Number(amount) > 0 && (
              <View style={styles.commissionBox}>
                <Ionicons name="sparkles" size={16} color={colors.primary} />
                <Typography variant="body" color="primary" style={{ marginLeft: 8 }}>
                  Vous gagnerez {format.currency(commission)} de commission
                </Typography>
              </View>
            )}

            <View style={styles.spacer} />

            <Button
              size="large"
              fullWidth
              onPress={handleConfirm}
              loading={loading}
              disabled={!amount}
            >
              Confirmer la recharge
            </Button>
          </View>
        )}
      </View>
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
    flex: 1,
    padding: 24,
  },
  scannerPlaceholder: {
    height: 300,
    backgroundColor: 'black',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  manualEntry: {
    padding: 16,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  label: {
    marginBottom: 12,
  },
  commissionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
  },
  spacer: {
    flex: 1,
  },
})
