import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../constants/theme'
import { Button } from '../../../src/components/ui/Button'
import { TextField } from '../../../src/components/ui/TextField'
import { Typography } from '../../../src/components/ui/Typography'

import * as ExpoLocation from 'expo-location'
import MapView, { Marker } from 'react-native-maps'

export default function HotspotSetupScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const styles = createStyles(colors)
  const [loading, setLoading] = useState(false)
  const mapRef = React.useRef<MapView>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ssid: '',
    password: '',
    lat: 12.3714,
    lng: -1.5197,
  })

  useEffect(() => {
    (async () => {
      let { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await ExpoLocation.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));

      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    })();
  }, [])

  const handleFinish = () => {
    if (!formData.name) {
      Alert.alert('Erreur', 'Le nom du hotspot est requis')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      Alert.alert(
        'Configuration terminée !',
        'Votre hotspot est maintenant prêt et visible sur la carte.',
        [
          { text: 'Aller au tableau de bord', onPress: () => router.replace('/(app)/(host)/dashboard') }
        ]
      )
    }, 1500)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="h3">Configuration du Hotspot</Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Typography variant="body" color="textSecondary" style={styles.subtitle}>
          Personnalisez votre point d&apos;accès pour que les utilisateurs puissent le trouver facilement.
        </Typography>

        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>Informations générales</Typography>
          <View style={styles.inputGroup}>
            <TextField
              label="Nom du Hotspot"
              placeholder="Ex: Cyber Café Central"
              value={formData.name}
              onChangeText={(t) => setFormData({ ...formData, name: t })}
            />
            <TextField
              label="Description / Point de repère"
              placeholder="Ex: Face à la pharmacie, portail bleu"
              value={formData.description}
              onChangeText={(t) => setFormData({ ...formData, description: t })}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>Localisation</Typography>
          <View style={[styles.mapContainer, { borderColor: colors.border }]}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: 12.3714,
                longitude: -1.5197,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              onRegionChangeComplete={(region) => {
                setFormData(prev => ({ ...prev, lat: region.latitude, lng: region.longitude }))
              }}
            >
              <Marker
                coordinate={{
                  latitude: formData.lat || 12.3714,
                  longitude: formData.lng || -1.5197
                }}
              />
            </MapView>
            <View style={styles.mapOverlay}>
              <Typography variant="caption" style={{ backgroundColor: 'white', padding: 4, borderRadius: 4 }}>
                Bougez la carte pour placer le marqueur
              </Typography>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Typography variant="h4" style={{ marginBottom: 4 }}>Configuration de l&apos;antenne</Typography>
          <View style={styles.inputGroup}>
            <TextField
              label="Nom du réseau (SSID)"
              placeholder="ZemNet_XXXX"
              value={formData.ssid}
              onChangeText={(t) => setFormData({ ...formData, ssid: t })}
            />
            <TextField
              label="Mot de passe (optionnel)"
              placeholder="Laisser vide si ouvert"
              value={formData.password}
              onChangeText={(t) => setFormData({ ...formData, password: t })}
              secureTextEntry
            />
          </View>
        </View>

        <Button
          size="lg"
          fullWidth
          onPress={handleFinish}
          loading={loading}
          style={styles.submitBtn}
        >
          Terminer la configuration
        </Button>
      </ScrollView>
    </SafeAreaView>
  )
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  subtitle: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  inputGroup: {
    gap: 16,
  },
  mapContainer: {
    height: 200,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
  },
  submitBtn: {
    marginTop: 16,
  },
})
