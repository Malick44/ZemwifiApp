import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Button } from '../../../src/components/ui/Button'
import { Card } from '../../../src/components/ui/Card'
import { TextField } from '../../../src/components/ui/TextField'
import { useTranslation } from '../../../src/lib/i18n'
import { useAuthStore } from '../../../src/stores/authStore'

export default function Settings() {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { profile, language, setLanguage, signOut, updateProfile } = useAuthStore()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { t } = useTranslation()

  const handleSaveProfile = async () => {
    if (!profile?.id) return

    setSaving(true)
    try {
      await updateProfile({ id: profile.id, full_name: fullName })
      Alert.alert('Succès', 'Profil mis à jour')
      setIsEditing(false)
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await signOut()
            router.replace('/(auth)/welcome')
          }
        }
      ]
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('settings_tab')}</Text>

      {/* Profile Section */}
      <Card>
        <Text style={styles.cardTitle}>Profil</Text>

        {isEditing ? (
          <>
            <TextField
              label={t('full_name')}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Votre nom"
            />
            <View style={styles.actions}>
              <Button
                label={t('save')}
                onPress={handleSaveProfile}
                loading={saving}
              />
              <Button
                label={t('cancel')}
                onPress={() => {
                  setIsEditing(false)
                  setFullName(profile?.full_name || '')
                }}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.profileInfo}>
              <Text style={styles.label}>Nom</Text>
              <Text style={styles.value}>{profile?.full_name || 'Non défini'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.label}>Téléphone</Text>
              <Text style={styles.value}>{profile?.phone || 'Non défini'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{profile?.email || 'Non défini'}</Text>
            </View>
            <Button
              label="Modifier le profil"
              onPress={() => setIsEditing(true)}
            />
          </>
        )}
      </Card>

      {/* Language Section */}
      <Card>
        <Text style={styles.cardTitle}>Langue / Language</Text>
        <View style={styles.languageButtons}>
          <Pressable
            style={[styles.languageButton, language === 'fr' && styles.languageButtonActive]}
            onPress={() => setLanguage('fr')}
          >
            <Text style={[styles.languageText, language === 'fr' && styles.languageTextActive]}>
              Français
            </Text>
          </Pressable>
          <Pressable
            style={[styles.languageButton, language === 'en' && styles.languageButtonActive]}
            onPress={() => setLanguage('en')}
          >
            <Text style={[styles.languageText, language === 'en' && styles.languageTextActive]}>
              English
            </Text>
          </Pressable>
        </View>
      </Card>

      {/* App Info */}
      <Card>
        <Text style={styles.cardTitle}>À propos</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Application</Text>
          <Text style={styles.infoValue}>ZemNet WiFi</Text>
        </View>
      </Card>

      {/* Links */}
      <Card>
        <Pressable
          style={styles.linkButton}
          onPress={() => router.push('/(app)/(shared)/support')}
        >
          <Text style={styles.linkText}>Support & Aide</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
        <Pressable
          style={styles.linkButton}
          onPress={() => router.push('/(app)/(shared)/legal')}
        >
          <Text style={styles.linkText}>Conditions & Confidentialité</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
        <Pressable
          style={styles.linkButton}
          onPress={() => router.push('/(app)/(shared)/about')}
        >
          <Text style={styles.linkText}>À propos de ZemNet</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </Card>

      {/* Sign Out */}
      <Button
        label={t('sign_out')}
        onPress={handleSignOut}
      />

      <View style={styles.spacer} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  profileInfo: { marginBottom: 16 },
  label: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  value: { fontSize: 16, color: '#111827', fontWeight: '500' },
  actions: { gap: 8, marginTop: 8 },
  languageButtons: { flexDirection: 'row', gap: 12 },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  languageButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  languageText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  languageTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: { fontSize: 14, color: '#6b7280' },
  infoValue: { fontSize: 14, color: '#111827', fontWeight: '500' },
  linkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  linkText: { fontSize: 16, color: '#111827' },
  arrow: { fontSize: 24, color: '#9ca3af' },
  spacer: { height: 32 },
})
