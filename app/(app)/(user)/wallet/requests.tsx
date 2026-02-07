import { Ionicons } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { Alert, FlatList, StyleSheet, View, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme'
import { Button } from '../../../../src/components/ui/Button'
import { Card } from '../../../../src/components/ui/Card'
import { Header } from '../../../../src/components/ui/Header'
import { Typography } from '../../../../src/components/ui/Typography'
import { format } from '../../../../src/lib/format'
import { useWalletStore } from '../../../../src/stores/walletStore'

export default function WalletRequestsScreen() {
    const router = useRouter()
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']
    const styles = createStyles(colors)

    const { pendingCashIns, refresh, confirmCashIn, loading } = useWalletStore()

    useEffect(() => {
        refresh()
        // Poll every 5s
        const interval = setInterval(refresh, 5000)
        return () => clearInterval(interval)
    }, [])

    const handleAction = async (id: string, decision: 'confirm' | 'deny') => {
        try {
            await confirmCashIn(id, decision)
            Alert.alert(decision === 'confirm' ? 'Confirmé' : 'Refusé', decision === 'confirm' ? 'Votre solde a été mis à jour.' : 'La demande a été refusée.')
        } catch (err: any) {
            Alert.alert('Erreur', err.message)
        }
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <Header title="Demandes en attente" showBack onBack={() => router.back()} />

            <View style={styles.content}>
                {pendingCashIns.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="documents-outline" size={48} color={colors.textSecondary} />
                        <Typography variant="body" color="textSecondary" style={{ marginTop: 16 }}>
                            Aucune demande en attente.
                        </Typography>
                    </View>
                ) : (
                    <FlatList
                        data={pendingCashIns}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ gap: 16 }}
                        renderItem={({ item }) => (
                            <Card variant="outlined" style={styles.requestCard}>
                                <View style={styles.row}>
                                    <View>
                                        <Typography variant="h3">{item.amount || 0} XOF</Typography>
                                        <Typography variant="caption" color="textSecondary">{format.date(item.created_at)}</Typography>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Typography variant="caption" color="warning" style={{ fontWeight: '700' }}>Expire: {new Date(item.expires_at).toLocaleTimeString()}</Typography>
                                    </View>
                                </View>

                                <View style={[styles.divider, { backgroundColor: 'rgba(0,0,0,0.05)' }]} />

                                <View style={styles.actions}>
                                    <Button
                                        label="Refuser"
                                        variant="secondary"
                                        style={{ flex: 1, borderColor: colors.error, borderWidth: 1, backgroundColor: 'transparent' }}
                                        onPress={() => handleAction(item.id, 'deny')}
                                        loading={loading}
                                    />
                                    <Button
                                        label="Confirmer"
                                        variant="primary"
                                        style={{ flex: 1, backgroundColor: colors.success }}
                                        onPress={() => handleAction(item.id, 'confirm')}
                                        loading={loading}
                                    />
                                </View>
                            </Card>
                        )}
                    />
                )}
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
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        marginVertical: 16,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    }
})
