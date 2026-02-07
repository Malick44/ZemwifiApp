import { BorderRadius, Colors, Spacing } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    useColorScheme,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '../../../../src/components/ui/Button'
import { Card } from '../../../../src/components/ui/Card'
import { Header } from '../../../../src/components/ui/Header'
import { TextField } from '../../../../src/components/ui/TextField'
import { Typography } from '../../../../src/components/ui/Typography'
import { format } from '../../../../src/lib/format'

type PaymentMethod = 'orange' | 'cash' | null

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000]

export default function TopUpScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const styles = createStyles(colors)

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const parsedAmount = parseInt(amount) || 0

  const handlePresetAmount = (value: number) => {
    setAmount(value.toString())
  }

  const handleOrangeMoney = async () => {
    if (parsedAmount < 100) {
      Alert.alert('Montant invalide', 'Le montant minimum est de 100 XOF')
      return
    }
    Keyboard.dismiss()
    setLoading(true)

    // TODO: Integrate Orange Money API / deep link
    // For now, show a placeholder flow
    Alert.alert(
      'Orange Money',
      `Vous allez être redirigé vers Orange Money pour payer ${format.currency(parsedAmount)} XOF.\n\nComposez le #144*82# ou utilisez l'app Orange Money.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Continuer',
          onPress: () => {
            // In production: initiate Orange Money payment via API
            Alert.alert(
              'En attente',
              'Confirmez le paiement sur votre téléphone Orange Money. Votre solde sera crédité automatiquement.',
            )
          },
        },
      ],
    )
    setLoading(false)
  }

  const handleCashToHost = () => {
    if (parsedAmount < 100) {
      Alert.alert('Montant invalide', 'Le montant minimum est de 100 XOF')
      return
    }
    Keyboard.dismiss()

    Alert.alert(
      'Rechargement en espèces',
      `Rendez-vous chez un hôte ZemWifi pour recharger ${format.currency(parsedAmount)} XOF en espèces.\n\nL'hôte créera une demande que vous devrez confirmer.`,
      [
        { text: 'OK', style: 'default' },
        {
          text: 'Voir mes demandes',
          onPress: () => router.push('/(app)/(user)/wallet/topup-requests'),
        },
      ],
    )
  }

  const handleContinue = () => {
    if (selectedMethod === 'orange') {
      handleOrangeMoney()
    } else if (selectedMethod === 'cash') {
      handleCashToHost()
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Recharger" showBack onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Amount Section */}
          <Typography variant="h3" style={styles.sectionTitle}>
            Montant à recharger
          </Typography>

          <TextField
            label=""
            placeholder="Entrez un montant"
            value={amount}
            onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
          />

          {/* Preset Amounts */}
          <View style={styles.presetsRow}>
            {PRESET_AMOUNTS.map((preset) => (
              <Pressable
                key={preset}
                style={[
                  styles.presetChip,
                  parsedAmount === preset && {
                    backgroundColor: colors.tint,
                    borderColor: colors.tint,
                  },
                ]}
                onPress={() => handlePresetAmount(preset)}
              >
                <Typography
                  variant="caption"
                  style={[
                    styles.presetText,
                    { color: parsedAmount === preset ? '#fff' : colors.text },
                  ]}
                >
                  {format.currency(preset)}
                </Typography>
              </Pressable>
            ))}
          </View>

          {/* Payment Methods */}
          <Typography variant="h3" style={styles.sectionTitle}>
            Méthode de paiement
          </Typography>

          {/* Orange Money */}
          <Pressable onPress={() => setSelectedMethod('orange')}>
            <Card
              variant={selectedMethod === 'orange' ? 'elevated' : 'outlined'}
              style={[
                styles.methodCard,
                selectedMethod === 'orange' && {
                  borderColor: '#FF6600',
                  borderWidth: 2,
                },
              ]}
            >
              <View style={styles.methodRow}>
                <View style={[styles.methodIcon, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="phone-portrait-outline" size={28} color="#FF6600" />
                </View>
                <View style={styles.methodInfo}>
                  <Typography variant="h3">Orange Money</Typography>
                  <Typography variant="caption" color={colors.textSecondary}>
                    Payez directement depuis votre compte Orange Money
                  </Typography>
                </View>
                <View
                  style={[
                    styles.radio,
                    selectedMethod === 'orange' && {
                      borderColor: '#FF6600',
                    },
                  ]}
                >
                  {selectedMethod === 'orange' && (
                    <View style={[styles.radioInner, { backgroundColor: '#FF6600' }]} />
                  )}
                </View>
              </View>
            </Card>
          </Pressable>

          {/* Cash to Host */}
          <Pressable onPress={() => setSelectedMethod('cash')}>
            <Card
              variant={selectedMethod === 'cash' ? 'elevated' : 'outlined'}
              style={[
                styles.methodCard,
                selectedMethod === 'cash' && {
                  borderColor: colors.success,
                  borderWidth: 2,
                },
              ]}
            >
              <View style={styles.methodRow}>
                <View style={[styles.methodIcon, { backgroundColor: colors.successBackground }]}>
                  <Ionicons name="cash-outline" size={28} color={colors.success} />
                </View>
                <View style={styles.methodInfo}>
                  <Typography variant="h3">Espèces (chez un hôte)</Typography>
                  <Typography variant="caption" color={colors.textSecondary}>
                    Donnez du cash à un hôte ZemWifi près de vous
                  </Typography>
                </View>
                <View
                  style={[
                    styles.radio,
                    selectedMethod === 'cash' && {
                      borderColor: colors.success,
                    },
                  ]}
                >
                  {selectedMethod === 'cash' && (
                    <View style={[styles.radioInner, { backgroundColor: colors.success }]} />
                  )}
                </View>
              </View>
            </Card>
          </Pressable>

          {/* Info Cards per Method */}
          {selectedMethod === 'orange' && (
            <Card variant="filled" style={[styles.infoCard, { backgroundColor: colors.infoBackground }]}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <Ionicons name="information-circle" size={20} color={colors.info} />
                <View style={{ flex: 1 }}>
                  <Typography variant="caption" color={colors.info} style={{ fontWeight: '600' }}>
                    Comment ça marche ?
                  </Typography>
                  <Typography variant="caption" color={colors.info} style={{ marginTop: 4 }}>
                    1. Entrez le montant souhaité{'\n'}
                    2. Confirmez le paiement via Orange Money{'\n'}
                    3. Votre solde est crédité instantanément
                  </Typography>
                </View>
              </View>
            </Card>
          )}

          {selectedMethod === 'cash' && (
            <Card variant="filled" style={[styles.infoCard, { backgroundColor: colors.warningBackground }]}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <Ionicons name="information-circle" size={20} color={colors.warning} />
                <View style={{ flex: 1 }}>
                  <Typography variant="caption" color={colors.warning} style={{ fontWeight: '600' }}>
                    Comment ça marche ?
                  </Typography>
                  <Typography variant="caption" color={colors.warning} style={{ marginTop: 4 }}>
                    1. Rendez-vous chez un hôte ZemWifi{'\n'}
                    2. L'hôte crée une demande de rechargement{'\n'}
                    3. Confirmez la demande dans votre portefeuille{'\n'}
                    4. Donnez le montant en espèces à l'hôte
                  </Typography>
                </View>
              </View>
            </Card>
          )}

          {/* Pending Requests shortcut */}
          <Pressable
            style={styles.pendingLink}
            onPress={() => router.push('/(app)/(user)/wallet/topup-requests')}
          >
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Ionicons name="time-outline" size={18} color={colors.tint} />
              <Typography variant="body" color={colors.tint} style={{ fontWeight: '500' }}>
                Voir mes demandes en cours
              </Typography>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.tint} />
          </Pressable>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomBar}>
          {parsedAmount > 0 && (
            <View style={styles.summaryRow}>
              <Typography variant="body" color={colors.textSecondary}>
                Montant
              </Typography>
              <Typography variant="h3">{format.currency(parsedAmount)} XOF</Typography>
            </View>
          )}
          <Button
            label={
              selectedMethod === 'orange'
                ? 'Payer avec Orange Money'
                : selectedMethod === 'cash'
                  ? 'Recharger en espèces'
                  : 'Choisissez une méthode'
            }
            variant="primary"
            onPress={handleContinue}
            loading={loading}
            disabled={!selectedMethod || parsedAmount < 100}
            style={
              selectedMethod === 'orange'
                ? { backgroundColor: '#FF6600' }
                : selectedMethod === 'cash'
                  ? { backgroundColor: colors.success }
                  : undefined
            }
            leftIcon={
              selectedMethod === 'orange' ? (
                <Ionicons name="phone-portrait-outline" size={20} color="#fff" />
              ) : selectedMethod === 'cash' ? (
                <Ionicons name="cash-outline" size={20} color="#fff" />
              ) : undefined
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: Spacing.md,
      paddingBottom: 120,
    },
    sectionTitle: {
      marginTop: Spacing.lg,
      marginBottom: Spacing.sm,
    },
    presetsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
      marginTop: Spacing.sm,
    },
    presetChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundSecondary,
    },
    presetText: {
      fontWeight: '600',
    },
    methodCard: {
      marginTop: Spacing.sm,
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
    },
    methodRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    methodIcon: {
      width: 52,
      height: 52,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    methodInfo: {
      flex: 1,
      gap: 2,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    infoCard: {
      marginTop: Spacing.md,
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
    },
    pendingLink: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: Spacing.lg,
      paddingVertical: Spacing.sm,
    },
    bottomBar: {
      padding: Spacing.md,
      paddingBottom: Spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
  })
