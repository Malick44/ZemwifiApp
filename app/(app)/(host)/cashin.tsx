import { Ionicons } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../constants/theme'
import { Button } from '../../../src/components/ui/Button'
import { Card } from '../../../src/components/ui/Card'
import { Header } from '../../../src/components/ui/Header'
import { TextField } from '../../../src/components/ui/TextField'
import { Typography } from '../../../src/components/ui/Typography'
import { useHostHotspotStore } from '../../../src/stores/hostHotspotStore'
import { useWalletStore } from '../../../src/stores/walletStore'
import { format } from '../../../src/lib/format'

export default function HostCashInScreen() {
    const router = useRouter()
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']
    const styles = createStyles(colors)

    const { 
        createCashInRequest, 
        completeCashIn, 
        cancelCashIn,
        fetchPendingCashIns,
        pendingCashIns, 
        loading 
    } = useHostHotspotStore()

    const [phone, setPhone] = useState('')
    const [amount, setAmount] = useState('')
    
    // Poll for updates
    useEffect(() => {
        fetchPendingCashIns()
        const interval = setInterval(fetchPendingCashIns, 3000)
        return () => clearInterval(interval)
    }, [])

    const handleSubmit = async () => {
        if (!phone || !amount) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs')
            return
        }

        try {
            await createCashInRequest(phone, parseInt(amount))
            Alert.alert('Succès', 'Demande envoyée')
            setPhone('')
            setAmount('')
            fetchPendingCashIns()
        } catch (err: any) {
            Alert.alert('Erreur', err.message || "Impossible de créer la demande")
        }
    }

    const handleComplete = async (id: string, amount: number) => {
        try {
           await completeCashIn(id)
           Alert.alert('Succès', 'Rechargement effectué avec succès')
           fetchPendingCashIns()
           // Refresh wallet to update balance in UI
           useWalletStore.getState().refresh()
        } catch(err: any){
            Alert.alert('Erreur', err.message)
        }
    }

    const handleCancel = async (id: string) => {
        try {
            await cancelCashIn(id)
            fetchPendingCashIns()
        } catch (err: any) {
            Alert.alert('Erreur', err.message)
        }
    }

    const renderItem = ({ item }: { item: any }) => {
        const isAccepted = item.status === 'accepted_by_user'
        
        return (
            <Card variant="outlined" style={[styles.requestCard, isAccepted && { borderColor: colors.success, borderWidth: 2 }]}>
                <View style={styles.row}>
                     <View>
                        <Typography variant="h3">{item.amount || 0} XOF</Typography>
                        <Typography variant="body" style={{ fontWeight: '500' }}>{item.user_phone}</Typography>
                        <Typography variant="caption" color="textSecondary">{format.date(item.created_at)}</Typography>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        {isAccepted ? (
                             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                <Typography variant="caption" color="success" style={{ fontWeight: '700' }}>PRÊT A VALIDER</Typography>
                             </View>
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons name="time-outline" size={16} color={colors.warning} />
                                <Typography variant="caption" color="warning" style={{ fontWeight: '700' }}>En attente</Typography>
                            </View>
                        )}
                        <Typography variant="caption" color="textSecondary">Expire: {new Date(item.expires_at).toLocaleTimeString()}</Typography>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: 'rgba(0,0,0,0.05)' }]} />

                <View style={styles.actions}>
                    {isAccepted ? (
                        <Button
                            label="VALIDER (ENCAISSÉ)"
                            variant="primary"
                            style={{ flex: 1, backgroundColor: colors.success }}
                            onPress={() => handleComplete(item.id, item.amount)}
                            loading={loading}
                        />
                    ) : (
                         <Button
                            label="Annuler"
                            variant="secondary"
                            style={{ flex: 1, borderColor: colors.error, borderWidth: 1, backgroundColor: 'transparent' }}
                            onPress={() => handleCancel(item.id)}
                            loading={loading}
                        />
                    )}
                </View>
                 {isAccepted && (
                    <Typography variant="caption" color="error" style={{ marginTop: 8, textAlign: 'center' }}>
                        ⚠️ Encaissez l'argent AVANT de valider
                    </Typography>
                )}
            </Card>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <Header title="Cash-in" showBack onBack={() => router.back()} />

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPendingCashIns} />}
            >
                {/* Create New Form */}
                <Card variant="elevated" style={styles.formCard}>
                    <Typography variant="h3" style={{ marginBottom: 16 }}>Nouveau Rechargement</Typography>
                    <TextField
                        label="Téléphone Client"
                        placeholder="+221..."
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
                        variant="primary" 
                        onPress={handleSubmit}
                        loading={loading} 
                    />
                </Card>

                {/* Pending List */}
                <View style={styles.listSection}>
                    <Typography variant="h3" style={{ marginBottom: 12 }}>Demandes en cours ({pendingCashIns.length})</Typography>
                    
                    {pendingCashIns.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Typography variant="caption" color="textSecondary">Aucune demande en cours</Typography>
                        </View>
                    ) : (
                        pendingCashIns.map(item => (
                            <View key={item.id} style={{ marginBottom: 16 }}>
                                {renderItem({ item })}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    formCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    listSection: {
        flex: 1,
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        borderRadius: 12,
        borderStyle: 'dashed'
    },
    requestCard: {
        padding: 16,
        borderRadius: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    }
})
