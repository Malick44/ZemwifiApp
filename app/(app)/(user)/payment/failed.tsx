import { Colors } from '@/constants/theme'
import { Button } from '@/src/components/ui/Button'
import { Typography } from '@/src/components/ui/Typography'
import { Ionicons } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet, View, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function PaymentFailed() {
    const router = useRouter()
    const colorScheme = useColorScheme()
    const colors = Colors[colorScheme ?? 'light']
    const styles = createStyles(colors)

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
                    <Ionicons name="close" size={64} color={colors.error} />
                </View>

                <Typography variant="h2" style={{ marginTop: 24, textAlign: 'center' }}>Échec du paiement</Typography>

                <Typography variant="body" color="secondary" style={{ marginTop: 12, textAlign: 'center', maxWidth: 300 }}>
                    Le paiement n'a pas pu être traité ou a expiré. Aucun montant n'a été débité de votre compte externe.
                </Typography>

                <View style={{ width: '100%', gap: 16, marginTop: 48 }}>
                    <Button
                        label="Réessayer"
                        variant="primary"
                        onPress={() => router.back()} // Go back to confirm/picker
                    />

                    <Link href="/(app)/(user)/wallet" asChild>
                        <Button label="Retour au portefeuille" variant="ghost" />
                    </Link>
                </View>
            </View>
        </SafeAreaView>
    )
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    container: { flex: 1 },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    }
})
