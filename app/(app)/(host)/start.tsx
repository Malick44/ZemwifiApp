import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import React from 'react'
import { ScrollView, StyleSheet, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../constants/theme'
import { Button } from '../../../src/components/ui/Button'
import { Card } from '../../../src/components/ui/Card'
import { Typography } from '../../../src/components/ui/Typography'

export default function HostStart() {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="wifi" size={48} color={colors.primary} />
          </View>
          <Typography variant="h1" style={styles.title}>
            Devenez un hôte ZemNet
          </Typography>
          <Typography variant="body" color="textSecondary" style={styles.subtitle}>
            Transformez votre connexion internet en revenus passifs tout en aidant votre communauté.
          </Typography>
        </View>

        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>Pourquoi devenir hôte ?</Typography>

          <View style={styles.benefitItem}>
            <View style={[styles.benefitIcon, { backgroundColor: colors.secondary }]}>
              <Ionicons name="cash-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.benefitText}>
              <Typography variant="h4">Gagnez de l'argent</Typography>
              <Typography variant="caption" color="textSecondary">
                Vendez des forfaits Wi-Fi et gagnez des commissions sur chaque recharge.
              </Typography>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={[styles.benefitIcon, { backgroundColor: colors.secondary }]}>
              <Ionicons name="people-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.benefitText}>
              <Typography variant="h4">Aidez la communauté</Typography>
              <Typography variant="caption" color="textSecondary">
                Offrez un accès internet abordable à votre quartier.
              </Typography>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={[styles.benefitIcon, { backgroundColor: colors.secondary }]}>
              <Ionicons name="trending-up-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.benefitText}>
              <Typography variant="h4">Revenus récurrents</Typography>
              <Typography variant="caption" color="textSecondary">
                2% de commission sur les recharges + revenus des forfaits.
              </Typography>
            </View>
          </View>
        </View>

        <Card variant="outlined" style={styles.requirementsCard}>
          <Typography variant="h4" style={styles.reqTitle}>Ce dont vous avez besoin</Typography>

          <View style={styles.reqItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Typography variant="body" style={styles.reqText}>Une connexion internet stable</Typography>
          </View>
          <View style={styles.reqItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Typography variant="body" style={styles.reqText}>Une pièce d'identité valide</Typography>
          </View>
          <View style={styles.reqItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Typography variant="body" style={styles.reqText}>Un routeur compatible (ou achetez-en un)</Typography>
          </View>
        </Card>

        <View style={styles.actions}>
          <Link href="/(app)/(host)/kyc" asChild>
            <Button size="large" fullWidth>
              Commencer la vérification
            </Button>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitText: {
    flex: 1,
  },
  requirementsCard: {
    padding: 20,
    marginBottom: 32,
  },
  reqTitle: {
    marginBottom: 16,
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reqText: {
    marginLeft: 12,
  },
  actions: {
    marginTop: 'auto',
  },
})
