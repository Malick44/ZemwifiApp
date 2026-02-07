import { Button } from '@/components/ui/Button';
import { CountryPicker } from '@/components/ui/CountryPicker';
import { Input } from '@/components/ui/Input';
import { Typography } from '@/components/ui/Typography';
import {
  COUNTRIES,
  Country,
  DEFAULT_COUNTRY_CODE,
  formatPhoneForCountry,
  getCountryByCode,
} from '@/constants/countries';
import { Spacing } from '@/constants/theme';
import { useAuthStore } from '@/src/stores/authStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PhoneScreen() {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [error, setError] = useState('');
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const loading = useAuthStore((s) => s.loading);

  const country = useMemo(
    () => getCountryByCode(countryCode) ?? COUNTRIES[0],
    [countryCode]
  );

  /** Max formatted string length (digits + spaces) */
  const maxLength = useMemo(
    () => country.phoneLength + country.formatPattern.length - 1,
    [country]
  );

  const handleCountrySelect = useCallback((c: Country) => {
    setCountryCode(c.code);
    // Reset phone when switching countries to avoid invalid leftovers
    setPhone('');
    setError('');
  }, []);

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const formatted = formatPhoneForCountry(digits, country);
    setPhone(formatted);
    setError('');
  };

  const validatePhone = (): boolean => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === country.phoneLength;
  };

  const handleSubmit = async () => {
    const digits = phone.replace(/\D/g, '');

    if (!validatePhone()) {
      setError(`Veuillez entrer un numéro valide (${country.phoneLength} chiffres)`);
      return;
    }

    const fullPhone = `${country.dialCode}${digits}`;

    try {
      await sendOtp(fullPhone);
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: fullPhone, countryCode },
      });
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Typography variant="h1" style={styles.title}>
              Connexion
            </Typography>
            <Typography variant="body" color="secondary" style={styles.subtitle}>
              Entrez votre numéro de téléphone pour recevoir un code de vérification
            </Typography>
          </View>

          {/* Phone Input */}
          <View style={styles.form}>
            <Input
              label="Numéro de téléphone"
              placeholder={formatPhoneForCountry('0'.repeat(country.phoneLength), country)}
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={maxLength}
              error={error}
              leftIcon={
                <CountryPicker
                  selectedCode={countryCode}
                  onSelect={handleCountrySelect}
                />
              }
              autoFocus
            />

            <Typography variant="caption" color="secondary" style={styles.hint}>
              Nous utilisons votre numéro pour sécuriser votre compte
            </Typography>
          </View>

          {/* Submit Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSubmit}
            loading={loading}
            disabled={!phone || loading}
            style={styles.button}
          >
            Continuer
          </Button>

          {/* Info */}
          <View style={styles.info}>
            <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
            <Typography variant="caption" color="secondary" style={{ textAlign: 'center', marginTop: 16 }}>
              En continuant, vous acceptez nos conditions d&apos;utilisation
            </Typography>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    paddingTop: Spacing['3xl'],
  },
  header: {
    marginBottom: Spacing['2xl'],
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    lineHeight: 24,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  hint: {
    marginTop: Spacing.sm,
  },
  button: {
    marginBottom: Spacing.lg,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
});
