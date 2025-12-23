import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useCashInStore } from '../../../src/stores/cashInStore'
import { useAuthStore } from '../../../src/stores/authStore'
import { Card } from '../../../src/components/ui/Card'
import { Button } from '../../../src/components/ui/Button'
import { TextField } from '../../../src/components/ui/TextField'
import { Badge } from '../../../src/components/ui/Badge'
import { EmptyState } from '../../../src/components/ui/EmptyState'
import { useTranslation } from '../../../src/lib/i18n'
import { format } from '../../../src/lib/format'

export default function HostCashin() {
  const [userPhone, setUserPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [creating, setCreating] = useState(false)
  const { requests, createRequest, confirmRequest, refresh, loading } = useCashInStore()
  const profile = useAuthStore((s) => s.profile)
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleCreateRequest = async () => {
    if (!userPhone || !amount || !profile?.id) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs')
      return
    }

    const amountNum = parseInt(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Erreur', 'Montant invalide')
      return
    }

    setCreating(true)
    const request = await createRequest(profile.id, amountNum, userPhone)
    setCreating(false)

    if (request) {
      Alert.alert('Succès', 'Demande de cash-in créée')
      setUserPhone('')
      setAmount('')
      
      // Generate QR for the request
      router.push({
        pathname: '/(modal)/qr',
        params: { 
          code: JSON.stringify({
            type: 'cashin_request',
            requestId: request.id,
            amount: amountNum,
            phone: userPhone,
          }),
          title: 'QR Cash-in'
        }
      })
    }
  }

  const handleConfirm = async (requestId: string) => {
    Alert.alert(
      'Confirmer',
      'Le client a-t-il payé en espèces ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              await confirmRequest(requestId)
              Alert.alert('Succès', 'Cash-in confirmé')
              await refresh()
            } catch (error) {
              Alert.alert('Erreur', 'Échec de la confirmation')
            }
          }
        }
      ]
    )
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const completedRequests = requests.filter(r => r.status === 'confirmed')

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('cash_in')}</Text>
      
      {/* Create New Request */}
      <Card>
        <Text style={styles.cardTitle}>Nouvelle demande</Text>
        <TextField
          label="Téléphone du client"
          value={userPhone}
          onChangeText={setUserPhone}
          placeholder="+225..."
          keyboardType="phone-pad"
        />
        <TextField
          label={t('amount')}
          value={amount}
          onChangeText={setAmount}
          placeholder="5000"
          keyboardType="numeric"
        />
        <Button 
          label="Créer la demande" 
          onPress={handleCreateRequest}
          loading={creating}
        />
      </Card>

      {/* Pending Requests */}
      <Text style={styles.sectionTitle}>Demandes en attente ({pendingRequests.length})</Text>
      
      {pendingRequests.length === 0 ? (
        <EmptyState 
          title="Aucune demande en attente"
          message="Créez une nouvelle demande ci-dessus"
        />
      ) : (
        <FlatList
          data={pendingRequests}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Card style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View>
                  <Text style={styles.requestAmount}>
                    {format.currency(item.amount)} XOF
                  </Text>
                  <Text style={styles.requestPhone}>{item.user_phone}</Text>
                  <Text style={styles.requestDate}>
                    {format.date(item.created_at)}
                  </Text>
                </View>
                <Badge text={item.status} color="orange" />
              </View>
              <View style={styles.actions}>
                <Button 
                  label="Confirmer" 
                  onPress={() => handleConfirm(item.id)}
                />
              </View>
            </Card>
          )}
        />
      )}

      {/* Recent Completed */}
      {completedRequests.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Récemment confirmés</Text>
          {completedRequests.slice(0, 3).map(item => (
            <Card key={item.id} style={styles.completedCard}>
              <View style={styles.requestHeader}>
                <View>
                  <Text style={styles.requestAmount}>
                    {format.currency(item.amount)} XOF
                  </Text>
                  <Text style={styles.requestPhone}>{item.user_phone}</Text>
                </View>
                <Badge text="Confirmé" color="green" />
              </View>
            </Card>
          ))}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({ 
  container: { flex: 1, padding: 16 }, 
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 12 },
  requestCard: { marginBottom: 12 },
  completedCard: { marginBottom: 8, opacity: 0.7 },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  requestAmount: { fontSize: 20, fontWeight: '700', color: '#2563eb' },
  requestPhone: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  requestDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  actions: { marginTop: 8 },
})
