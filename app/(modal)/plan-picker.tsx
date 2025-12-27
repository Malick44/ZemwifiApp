import { Ionicons } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../constants/theme'
import { Card } from '../../src/components/ui/Card'
import { Header } from '../../src/components/ui/Header'
import { Typography } from '../../src/components/ui/Typography'
import { format } from '../../src/lib/format'
import { supabase } from '../../src/lib/supabase'
import { Plan } from '../../src/types/domain'

export default function PlanPickerModal() {
    const { hotspotId } = useLocalSearchParams<{ hotspotId: string }>()
    const router = useRouter()
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']
    const styles = createStyles(colors)

    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadPlans() {
            if (!hotspotId) return
            try {
                const { data, error } = await supabase
                    .from('plans')
                    .select('*')
                    .eq('hotspot_id', hotspotId)
                    .eq('is_active', true)
                    .order('price_xof', { ascending: true })

                if (error) throw error
                setPlans(data as any) // Type might need adjustment if duration_s mismatch
            } catch (err: any) {
                console.error("Error loading plans:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        loadPlans()
    }, [hotspotId])

    const handleSelect = (plan: Plan) => {
        // Navigate to payment confirmation with selected plan
        // Or return result. Usually we navigate forward.
        router.dismiss() // Close modal if needed, but better to push to payment
        router.push({
            pathname: '/(app)/(user)/payment/confirm',
            params: { planId: plan.id, hotspotId: hotspotId }
        })
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />
            <Header
                title="Choisir un forfait"
                rightAction={
                    <Pressable onPress={() => router.dismiss()}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </Pressable>
                }
            />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Typography variant="body" color="error">{error}</Typography>
                </View>
            ) : plans.length === 0 ? (
                <View style={styles.center}>
                    <Typography variant="body">Aucun forfait disponible pour ce hotspot.</Typography>
                </View>
            ) : (
                <FlatList
                    data={plans}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16, gap: 12 }}
                    renderItem={({ item }) => (
                        <Pressable onPress={() => handleSelect(item)}>
                            <Card variant="outlined" style={styles.planCard}>
                                <View style={{ flex: 1 }}>
                                    <Typography variant="h3">{item.name}</Typography>
                                    <Typography variant="body" color="textSecondary" style={{ marginTop: 4 }}>
                                        {format.duration(item.duration_s || item.duration_seconds)} • {format.dataSize(item.data_cap_bytes || 0)}
                                    </Typography>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Typography variant="h3" color="primary">{format.currency(item.price_xof)}</Typography>
                                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{ marginTop: 8 }} />
                                </View>
                            </Card>
                        </Pressable>
                    )}
                />
            )}
        </SafeAreaView>
    )
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    planCard: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})
