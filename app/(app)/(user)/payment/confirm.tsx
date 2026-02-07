import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme'
import { Button } from '../../../../src/components/ui/Button'
import { Card } from '../../../../src/components/ui/Card'
import { Header } from '../../../../src/components/ui/Header'
import { Typography } from '../../../../src/components/ui/Typography'
import { format } from '../../../../src/lib/format'
import { supabase } from '../../../../src/lib/supabase'
import { useWalletStore } from '../../../../src/stores/walletStore'
import { Plan } from '../../../../src/types/domain'
import { COLUMNS, RPC, TABLES } from '@/constants/db'

export default function PaymentConfirmScreen() {
    const { planId, hotspotId } = useLocalSearchParams<{ planId: string, hotspotId: string }>()
    const router = useRouter()
    const { balance, refresh } = useWalletStore()

    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']
    const styles = createStyles(colors)

    const [plan, setPlan] = useState<Plan | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        async function loadData() {
            if (!planId) return
            const { data } = await supabase
                .from(TABLES.PLANS)
                .select('*')
                .eq(COLUMNS.PLANS.ID, planId)
                .single()
            setPlan(data as any)
            setLoading(false)
            refresh() // Refresh balance
        }
        loadData()
    }, [planId])

    const handleConfirm = async () => {
        if (!plan || !hotspotId) return
        setProcessing(true)
        try {
            const { data, error } = await supabase.rpc(RPC.PROCESS_PURCHASE, {
                p_hotspot_id: hotspotId,
                p_plan_id: plan.id,
                p_provider: 'wallet'
            })

            if (error) throw error

            // Success
            await refresh()
            Alert.alert("Succès", "Forfait activé avec succès !")

            // Navigate to voucher or wallet
            // Since process_purchase returns voucher_token, ideally we show it.
            // Or we go to transaction/voucher detail.
            // For now, go to wallet root where new voucher will appear.
            router.dismissAll()
            router.replace('/(app)/(user)/wallet')

        } catch (err: any) {
            console.error(err)
            // If insufficient funds, maybe show specific message
            if (err.message.includes('Insufficient funds')) {
                Alert.alert('Solde insuffisant', 'Veuillez recharger votre compte.')
            } else {
                router.push('/(app)/(user)/payment/failed')
            }
        } finally {
            setProcessing(false)
        }
    }

    if (loading || !plan) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <Header title="Confirmation" showBack onBack={() => router.back()} />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                    <Typography variant="h2">{format.currency(plan.price_xof)}</Typography>
                    <Typography variant="body" color="textSecondary">Montant à payer</Typography>
                </View>

                <Card variant="outlined" style={{ padding: 16 }}>
                    <View style={styles.row}>
                        <Typography variant="body" color="textSecondary">Forfait</Typography>
                        <Typography variant="h3">{plan.name}</Typography>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Typography variant="body" color="textSecondary">Durée</Typography>
                        <Typography variant="body">{format.duration(plan.duration_s)}</Typography>
                    </View>
                    <View style={styles.row}>
                        <Typography variant="body" color="textSecondary">Data</Typography>
                        <Typography variant="body">{format.dataSize(plan.data_cap_bytes || 0)}</Typography>
                    </View>
                </Card>

                <View style={{ marginTop: 24 }}>
                    <View style={styles.row}>
                        <Typography variant="body">Solde actuel</Typography>
                        <Typography variant="h3">{format.currency(balance)}</Typography>
                    </View>
                    {balance < plan.price_xof && (
                        <Typography variant="caption" color="error" style={{ marginTop: 8 }}>
                            Solde insuffisant. Rechargez votre compte auprès d'un hôte.
                        </Typography>
                    )}
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <Button
                    label={balance >= plan.price_xof ? "Confirmer le paiement" : "Solde insuffisant"}
                    onPress={handleConfirm}
                    fullWidth
                    loading={processing}
                    disabled={balance < plan.price_xof}
                    variant={balance >= plan.price_xof ? "primary" : "secondary"}
                />
            </View>
        </SafeAreaView>
    )
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: colors.border }
})
