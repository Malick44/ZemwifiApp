import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Typography } from '@/components/ui/Typography';
import { Spacing } from '@/constants/theme';
import { useAuthStore } from '@/src/stores/authStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PhoneScreen() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const loading = useAuthStore((s) => s.loading);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');

    // Format as: 70 12 34 56 (max 8 digits)
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    if (numbers.length <= 6) return `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4)}`;
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 6)} ${numbers.slice(6, 8)}`;
  };

  const validatePhone = (value: string): boolean => {
    // Burkina Faso phone numbers: 8 digits
    const numbers = value.replace(/\D/g, '');
    return numbers.length === 8;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhone(formatted);
    setError('');
  };

  const handleSubmit = async () => {
    const phoneNumbers = phone.replace(/\D/g, '');

    if (!validatePhone(phone)) {
      setError('Veuillez entrer un numéro valide (8 chiffres)');
      return;
    }

    const fullPhone = `+226${phoneNumbers}`;

    try {
      await sendOtp(fullPhone);
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: fullPhone },
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
              placeholder="70 12 34 56"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={11} // "70 12 34 56" = 11 chars with spaces
              error={error}
              leftIcon={
                <Typography variant="body" color="secondary">
                  +226
                </Typography>
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
