import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/src/stores/authStore';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const { phone, countryCode } = useLocalSearchParams<{ phone: string; countryCode?: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const loading = useAuthStore((s) => s.loading);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    // Handle paste of multiple digits
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
      if (digits.length === OTP_LENGTH) {
        const newOtp = digits.split('');
        setOtp(newOtp);
        setError('');
        handleVerify(digits);
        return;
      }
    }

    // Only allow numbers
    if (text && !/^\d$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError('');

    // Auto-advance to next input
    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (text && index === OTP_LENGTH - 1) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === OTP_LENGTH) {
        handleVerify(fullOtp);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join('');
    
    if (otpCode.length !== OTP_LENGTH) {
      setError('Veuillez entrer le code complet');
      return;
    }

    try {
      await verifyOtp(phone || '', otpCode, countryCode);
      // Check if user needs to complete profile
      router.replace('/(auth)/profile');
    } catch (err: any) {
      setError(err.message || 'Code invalide');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    try {
      await sendOtp(phone || '');
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du code');
    }
  };

  const handleClear = () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>
            Code de vérification
          </Typography>
          <Typography variant="body" color="secondary" style={styles.subtitle}>
            Nous avons envoyé un code à 6 chiffres au
          </Typography>
          <Typography variant="body" weight="semibold" style={styles.phone}>
            {phone}
          </Typography>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                {
                  backgroundColor: colors.background,
                  borderColor: error
                    ? colors.error
                    : digit
                    ? colors.primary
                    : colors.border,
                  color: colors.text,
                },
              ]}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Error Message */}
        {error && (
          <Typography variant="bodySmall" color="error" align="center" style={styles.error}>
            {error}
          </Typography>
        )}

        {/* Clear Button */}
        {otp.some((d) => d) && (
          <Pressable onPress={handleClear} style={styles.clearButton}>
            <Typography variant="bodySmall" color="secondary">
              Effacer
            </Typography>
          </Pressable>
        )}

        {/* Verify Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => handleVerify()}
          loading={loading}
          disabled={otp.join('').length !== OTP_LENGTH || loading}
          style={styles.button}
        >
          Vérifier
        </Button>

        {/* Resend Timer */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <Pressable onPress={handleResend}>
              <Typography variant="body" style={{ color: colors.primary }}>
                Renvoyer le code
              </Typography>
            </Pressable>
          ) : (
            <Typography variant="body" color="secondary">
              Renvoyer le code dans {timer}s
            </Typography>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
    marginBottom: Spacing.xs,
    lineHeight: 24,
  },
  phone: {
    marginTop: Spacing.xs,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  error: {
    marginBottom: Spacing.md,
  },
  clearButton: {
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  button: {
    marginBottom: Spacing.lg,
  },
  resendContainer: {
    alignItems: 'center',
  },
});
