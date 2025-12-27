import { Ionicons } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, StyleSheet, View, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../constants/theme'
import { Button } from '../../../src/components/ui/Button'
import { Card } from '../../../src/components/ui/Card'
import { Header } from '../../../src/components/ui/Header'
import { TextField } from '../../../src/components/ui/TextField'
import { Typography } from '../../../src/components/ui/Typography'
import { useHostHotspotStore } from '../../../src/stores/hostHotspotStore'

export default function HostCashInScreen() {
    const router = useRouter()
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']
    const styles = createStyles(colors)

    const { createCashInRequest, loading } = useHostHotspotStore()

    const [phone, setPhone] = useState('')
    const [amount, setAmount] = useState('')
    const [status, setStatus] = useState<'idle' | 'pending_conf' | 'success'>('idle')
    const [expiresAt, setExpiresAt] = useState<string | null>(null)

    const handleSubmit = async () => {
        if (!phone || !amount) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs')
            return
        }

        try {
            const result = await createCashInRequest(phone, parseInt(amount))
            setStatus('pending_conf')
            setExpiresAt(result.expires_at)
            Alert.alert('Demande envoyée', "En attente de la confirmation de l'utilisateur. Le solde sera crédité une fois validé.")
        } catch (err: any) {
            Alert.alert('Erreur', err.message || "Impossible de créer la demande")
        }
    }

    const reset = () => {
        setPhone('')
        setAmount('')
        setStatus('idle')
        setExpiresAt(null)
    }

    if (status === 'pending_conf') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title="Cash-in" showBack onBack={() => router.back()} />
                <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="time-outline" size={64} color={colors.warning} />
                    <Typography variant="h2" style={{ marginTop: 16 }}>En attente</Typography>
                    <Typography variant="body" style={{ textAlign: 'center', marginTop: 8, maxWidth: 300 }}>
                        La demande de {amount} XOF pour {phone} a été envoyée.
                    </Typography>
                    <Typography variant="caption" color="textSecondary" style={{ marginTop: 8 }}>
                        Expire à: {expiresAt ? new Date(expiresAt).toLocaleTimeString() : ''}
                    </Typography>

                    <Button label="Nouvelle demande" variant="secondary" onPress={reset} style={{ marginTop: 32, width: '100%' }} />
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <Header title="Nouveau Cash-in" showBack onBack={() => router.back()} />

            <View style={styles.content}>
                <Card variant="outlined" style={styles.formCard}>
                    <Typography variant="body" style={{ marginBottom: 16 }}>
                        Initiez un rechargement pour un utilisateur. Il devra confirmer sur son téléphone.
                    </Typography>

                    <TextField
                        label="Numéro de téléphone"
                        placeholder="Ex: 0102030405"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />

                    <View style={{ height: 16 }} />

                    <TextField
                        label="Montant (XOF)"
                        placeholder="Ex: 1000"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                    />

                    <View style={{ height: 24 }} />

                    <Button
                        label="Envoyer la demande"
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={!phone || !amount}
                    />
                </Card>
            </View>
        </SafeAreaView>
    )
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    formCard: {
        padding: 24,
        borderRadius: 16,
    }
})
