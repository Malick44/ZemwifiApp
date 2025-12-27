import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import * as Linking from 'expo-linking'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme'
import { Button } from '../../../../src/components/ui/Button'
import { Card } from '../../../../src/components/ui/Card'
import { Header } from '../../../../src/components/ui/Header'
import { Typography } from '../../../../src/components/ui/Typography'
import { format } from '../../../../src/lib/format'
import { useWalletStore } from '../../../../src/stores/walletStore'

export default function VoucherDetail() {
  const { voucherId } = useLocalSearchParams<{ voucherId: string }>()
  const router = useRouter()
  const { vouchers, refresh, loading } = useWalletStore()
  const voucher = vouchers.find((v) => v.id === voucherId)

  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const styles = createStyles(colors)

  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!voucher) refresh()
  }, [])

  if (loading && !voucher) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!voucher) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Typography variant="h4">Voucher introuvable</Typography>
        <Button label="Retour" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </View>
    )
  }

  const token = voucher.token || voucher.code || 'ERROR-NO-TOKEN'

  const handleCopy = async () => {
    await Clipboard.setStringAsync(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenPortal = async () => {
    // 1. Copy to clipboard first as backup
    await Clipboard.setStringAsync(token)

    // 2. Open Portal URL
    // Contract: http://login.zemnet/enter?token=<token>&src=app
    const portalUrl = `http://login.zemnet/enter?token=${encodeURIComponent(token)}&src=app`

    try {
      const supported = await Linking.canOpenURL(portalUrl)
      if (supported) {
        await Linking.openURL(portalUrl)
      } else {
        // Fallback: try http://neverssl.com (captive portal trigger)
        Alert.alert("Portail non détecté", "Nous allons ouvrir une page pour déclencher le portail. Vous pourrez coller votre code.", [
          { text: "Ouvrir", onPress: () => Linking.openURL('http://neverssl.com') }
        ])
      }
    } catch (err) {
      Alert.alert("Erreur", "Impossible d'ouvrir le navigateur")
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Détails du Voucher"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tokenContainer}>
          <Typography variant="h4" style={{ marginBottom: 8, textAlign: 'center' }}>Votre Code d'Accès</Typography>

          <TouchableOpacity style={[styles.tokenBox, { borderColor: colors.primary, backgroundColor: colors.backgroundSecondary }]} onPress={handleCopy}>
            <Typography variant="h2" style={{ textAlign: 'center', color: colors.primary }}>{token}</Typography>
            <Ionicons name={copied ? "checkmark" : "copy-outline"} size={20} color={colors.textSecondary} style={{ position: 'absolute', right: 12, top: 12 }} />
          </TouchableOpacity>

          {copied && <Typography variant="caption" color="success" style={{ alignSelf: 'center', marginTop: 4 }}>Copié !</Typography>}
        </View>

        <View style={{ gap: 16 }}>
          <Button
            label="Se Connecter (Ouvrir le Portail)"
            onPress={handleOpenPortal}
          />

          <Button
            variant="secondary"
            label="Copier le code"
            onPress={handleCopy}
          />
        </View>

        <Card variant="outlined" style={styles.infoCard}>
          <View style={styles.row}>
            <Typography variant="body" color="textSecondary">Hotspot</Typography>
            <Typography variant="body" weight="bold">Hotspot {voucher.hotspot_id.slice(0, 4)}...</Typography>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Typography variant="body" color="textSecondary">Expire le</Typography>
            <Typography variant="body">{format.date(voucher.expires_at)}</Typography>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Typography variant="body" color="textSecondary">Statut</Typography>
            <Badge label={voucher.used_at ? "Utilisé" : "Actif"} variant={voucher.used_at ? "neutral" : "success"} />
          </View>
        </Card>

        {/* Instructions */}
        <Card variant="filled" style={[styles.helpCard, { backgroundColor: colors.infoBackground }]}>
          <Typography variant="h4" style={{ marginBottom: 8 }}>Comment se connecter ?</Typography>
          <Typography variant="body" style={{ marginBottom: 8 }}>1. Assurez-vous d'être connecté au Wi-Fi du Hotspot.</Typography>
          <Typography variant="body" style={{ marginBottom: 8 }}>2. Cliquez sur "Se Connecter" ci-dessus.</Typography>
          <Typography variant="body">3. Si la page s'ouvre, le code sera déjà rempli. Sinon, collez-le.</Typography>
        </Card>

      </ScrollView>
    </SafeAreaView>
  )
}

function Badge({ label, variant }: { label: string, variant: 'success' | 'neutral' | 'error' }) {
  const color = variant === 'success' ? '#10b981' : variant === 'error' ? '#ef4444' : '#6b7280'
  const bg = variant === 'success' ? '#d1fae5' : variant === 'error' ? '#fee2e2' : '#f3f4f6'
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: bg }}>
      <Typography variant="caption" style={{ color: color, fontWeight: '700' }}>{label}</Typography>
    </View>
  )
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    gap: 24,
  },
  tokenContainer: {
    alignItems: 'stretch',
  },
  tokenBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    justifyContent: 'center',
    marginBottom: 8,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  helpCard: {
    padding: 16,
    borderRadius: 12,
  }
})
