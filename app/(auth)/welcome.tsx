import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { BrandColors, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function WelcomeScreen() {
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = createStyles(colors);

  const features = [
    {
      icon: 'wifi' as const,
      title: language === 'fr' ? 'Trouvez du Wi-Fi près de vous' : 'Find Wi-Fi near you',
      description: language === 'fr' ? 'Découvrez des hotspots partout' : 'Discover hotspots everywhere',
    },
    {
      icon: 'phone-portrait' as const,
      title: language === 'fr' ? 'Payez avec mobile money' : 'Pay with mobile money',
      description: language === 'fr' ? 'Wave, Orange Money, Moov Money' : 'Wave, Orange Money, Moov Money',
    },
    {
      icon: 'flash' as const,
      title: language === 'fr' ? 'Accès instantané' : 'Instant access',
      description: language === 'fr' ? 'Connectez-vous en quelques secondes' : 'Connect in seconds',
    },
  ];

  const texts = {
    fr: {
      welcome: 'Bienvenue sur',
      appName: 'ZemNet',
      tagline: 'Internet pour tous, partout au Burkina Faso',
      getStarted: 'Commencer',
      continueAsGuest: 'Continuer en invité',
    },
    en: {
      welcome: 'Welcome to',
      appName: 'ZemNet',
      tagline: 'Internet for everyone, everywhere in Burkina Faso',
      getStarted: 'Get Started',
      continueAsGuest: 'Continue as guest',
    },
  };

  const t = texts[language];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={styles.container}>
        <LinearGradient
          colors={[BrandColors.primary, BrandColors.primaryDark]}
          style={styles.gradient}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Language Toggle */}
            <View style={styles.languageContainer}>
              <Pressable
                onPress={() => setLanguage('fr')}
                style={[
                  styles.languageButton,
                  language === 'fr' && styles.languageButtonActive,
                ]}
              >
                <Typography
                  variant="bodySmall"
                  weight="medium"
                  style={{
                    color: language === 'fr' ? BrandColors.primary : colors.textInverse,
                  }}
                >
                  Français
                </Typography>
              </Pressable>
              <Pressable
                onPress={() => setLanguage('en')}
                style={[
                  styles.languageButton,
                  language === 'en' && styles.languageButtonActive,
                ]}
              >
                <Typography
                  variant="bodySmall"
                  weight="medium"
                  style={{
                    color: language === 'en' ? BrandColors.primary : colors.textInverse,
                  }}
                >
                  English
                </Typography>
              </Pressable>
            </View>

            {/* Hero Section */}
            <View style={styles.hero}>
              <Typography variant="h2" style={styles.welcomeText}>
                {t.welcome}
              </Typography>
              <Typography variant="h1" style={styles.appName}>
                {t.appName}
              </Typography>
              <Typography
                variant="body"
                align="center"
                style={styles.tagline}
              >
                {t.tagline}
              </Typography>
            </View>

            {/* Features */}
            <View style={styles.features}>
              {features.map((feature, index) => (
                <Card key={index} variant="filled" style={styles.featureCard}>
                  <View style={styles.featureContent}>
                    <View style={styles.iconContainer}>
                      <Ionicons name={feature.icon} size={32} color={BrandColors.primary} />
                    </View>
                    <View style={styles.featureText}>
                      <Typography variant="body" weight="semibold">
                        {feature.title}
                      </Typography>
                      <Typography variant="bodySmall" color="secondary">
                        {feature.description}
                      </Typography>
                    </View>
                  </View>
                </Card>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={() => router.push('/(auth)/phone')}
              >
                {t.getStarted}
              </Button>
              <Button
                variant="ghost"
                size="md"
                fullWidth
                onPress={() => router.push('/(app)/(user)/map')}
              >
                {t.continueAsGuest}
              </Button>

              {/* Dev Panel - Only in development */}
              {__DEV__ && (
                <Pressable
                  style={styles.devPanelButton}
                  onPress={() => router.push('/(app)/(shared)/dev-panel')}
                >
                  <Ionicons name="construct-outline" size={16} color={colors.overlayWhiteMedium} />
                  <Typography variant="caption" style={styles.devPanelText}>
                    Dev Panel
                  </Typography>
                </Pressable>
              )}
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    paddingTop: Spacing['3xl'],
  },
  languageContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  languageButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.overlayWhiteMedium,
  },
  languageButtonActive: {
    backgroundColor: colors.background,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  welcomeText: {
    color: colors.textInverse,
    opacity: 0.9,
    marginBottom: Spacing.xs,
  },
  appName: {
    color: colors.textInverse,
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  tagline: {
    color: colors.textInverse,
    opacity: 0.8,
    maxWidth: 280,
  },
  features: {
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  featureCard: {
    backgroundColor: colors.overlayWhite,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${BrandColors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    gap: Spacing.xs,
  },
  actions: {
    gap: Spacing.md,
    marginTop: 'auto',
  },
  devPanelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.overlayWhite,
    borderWidth: 1,
    borderColor: colors.overlayWhiteMedium,
  },
  devPanelText: {
    color: colors.overlayWhiteLight,
    fontSize: 12,
  },
})

