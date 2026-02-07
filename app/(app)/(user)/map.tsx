import { ENUMS } from '@/constants/db'
import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import * as ExpoLocation from 'expo-location'
import { Link, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '../../../src/components/ui/Button'
import { Typography } from '../../../src/components/ui/Typography'
import { useDiscoveryStore } from '../../../src/stores/discoveryStore'

import { Header } from '../../../src/components/ui/Header'

export default function MapScreen() {
  const { hotspots, fetchNearbyHotspots, loading, setUserLocation, userLocation } = useDiscoveryStore()
  const router = useRouter()
  const [selectedHotspot, setSelectedHotspot] = useState<typeof hotspots[0] | null>(null)
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']

  // Filtered hotspots based on location (real availability) - ensure uniqueness
  const nearbyHotspots = React.useMemo(() => {
    const unique = new Map();
    hotspots.forEach(h => {
      if (h.id) unique.set(h.id, h);
    });
    return Array.from(unique.values());
  }, [hotspots]);

  const mapRef = React.useRef<MapView>(null)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')

  // 1. Watch Location on Mount
  useEffect(() => {
    let subscription: ExpoLocation.LocationSubscription | null = null;

    (async () => {
      let { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied');
        return;
      }

      console.log('Watching user location...');
      subscription = await ExpoLocation.watchPositionAsync(
        {
          accuracy: ExpoLocation.Accuracy.Highest,
          timeInterval: 1000,
          distanceInterval: 10, // Update if moved 10 meters
        },
        (location) => {
          console.log('Location Update:', location.coords.latitude, location.coords.longitude);
          setUserLocation({
            lat: location.coords.latitude,
            lng: location.coords.longitude
          });

          // Fetch hotspots around new location
          // Note: We might want to debounce this or only fetch if moved significantly
          fetchNearbyHotspots(location.coords.latitude, location.coords.longitude);
        }
      );
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // 2. Animate Map when User Location updates (Initially or on Recenter)
  // We use a separate state to track if we have performed the "Initial Center" to avoid locking user
  const [initialCenterDone, setInitialCenterDone] = useState(false);

  useEffect(() => {
    if (userLocation && mapRef.current && !initialCenterDone) {
      console.log('Performing initial map center:', userLocation);
      setTimeout(() => {
        mapRef.current?.animateToRegion({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          latitudeDelta: 0.01, // Zoom closer for precision (approx 1km)
          longitudeDelta: 0.01,
        }, 1000);
        setInitialCenterDone(true);
      }, 500);
    }
  }, [userLocation, initialCenterDone]);

  const recenterMap = () => {
    if (userLocation && mapRef.current) {
      console.log('📍 Recenter tapped. Coordinates:', userLocation.lat, userLocation.lng);
      mapRef.current.animateToRegion({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    } else {
      console.log('📍 Recenter tapped but location is not yet available.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Header
        title="Points Wi-Fi à proximité"
        subtitle={`${nearbyHotspots.filter(h => h.status === ENUMS.HOTSPOT_STATUS.ONLINE).length} hotspots en ligne`}
        rightAction={
          <View style={[styles.viewToggle, { backgroundColor: colors.textTertiary + '20' }]}>
            <TouchableOpacity
              onPress={() => setViewMode('map')}
              style={[
                styles.toggleButton,
                viewMode === 'map' && { backgroundColor: colors.primary }
              ]}
            >
              <Ionicons
                name="map"
                size={18}
                color={viewMode === 'map' ? 'white' : colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('list')}
              style={[
                styles.toggleButton,
                viewMode === 'list' && { backgroundColor: colors.primary }
              ]}
            >
              <Ionicons
                name="list"
                size={18}
                color={viewMode === 'list' ? 'white' : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        }
      />


      {/* Map View */}
      {viewMode === 'map' && (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: 12.3714,
              longitude: -1.5197,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation
            showsMyLocationButton={false}
            onPress={() => setSelectedHotspot(null)}
          >
            {nearbyHotspots.map((hotspot) => (
              <Marker
                key={hotspot.id}
                coordinate={{
                  latitude: hotspot.lat || 0,
                  longitude: hotspot.lng || 0,
                }}
                onPress={(e) => {
                  e.stopPropagation()
                  console.log('Marker pressed:', hotspot.name)
                  setSelectedHotspot(hotspot)
                }}
              >
                <View style={[
                  styles.customMarker,
                  {
                    backgroundColor: hotspot.status === ENUMS.HOTSPOT_STATUS.ONLINE ? colors.success : colors.textTertiary,
                    borderColor: selectedHotspot?.id === hotspot.id ? colors.primary : 'white'
                  }
                ]}>
                  <Ionicons name="location" size={20} color="white" />
                </View>
              </Marker>
            ))}
          </MapView>

          {loading && (
            <View style={styles.mapLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Typography variant="caption" style={{ marginTop: 8 }}>Recherche...</Typography>
            </View>
          )}

          {/* Floating Recenter Button - Hide when bottom sheet is visible */}
          {!selectedHotspot && (
            <TouchableOpacity
              onPress={recenterMap}
              style={[styles.floatingRecenter, { backgroundColor: colors.background }]}
            >
              <Ionicons name="navigate" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}

          {/* Bottom Sheet Card */}
          {selectedHotspot && (
            <View style={[styles.bottomCard, { backgroundColor: colors.background }]}>
              <View style={styles.cardHeader}>
                <Typography variant="h3">{selectedHotspot.name}</Typography>
                {selectedHotspot.status === ENUMS.HOTSPOT_STATUS.ONLINE && (
                  <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
                    <View style={[styles.dot, { backgroundColor: colors.success }]} />
                    <Typography variant="caption" color={colors.success}>En ligne</Typography>
                  </View>
                )}
              </View>

              <View style={styles.cardRow}>
                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                <Typography variant="body" color={colors.textSecondary} style={{ flex: 1, marginLeft: 6 }}>
                  {selectedHotspot.address || selectedHotspot.landmark}
                </Typography>
              </View>

              {/* Wi-Fi Range Info */}
              <View style={styles.cardRow}>
                <Ionicons name="wifi" size={16} color={colors.textSecondary} />
                <Typography variant="caption" color={colors.textSecondary} style={{ marginLeft: 6 }}>
                  Portée Wi-Fi: ~100m
                </Typography>
              </View>

              <View style={styles.cardRow}>
                <Typography variant="body" style={{ fontWeight: '600' }}>À partir de 150 XOF</Typography>
                {(selectedHotspot.distance !== undefined && selectedHotspot.distance >= 0) && (
                  <Typography variant="caption" color={colors.textSecondary} style={{ marginLeft: 12 }}>
                    {selectedHotspot.distance.toFixed(0)} m
                  </Typography>
                )}
              </View>

              <View style={styles.cardActions}>
                <Link href={{ pathname: '/(app)/(user)/hotspot/[id]', params: { id: selectedHotspot.id } }} asChild>
                  <Button label="Voir les plans" style={{ flex: 1 }} />
                </Link>
                <Button
                  label="Fermer"
                  variant="tertiary"
                  style={{ flex: 1 }}
                  onPress={() => setSelectedHotspot(null)}
                />
              </View>
            </View>
          )}
        </View>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <FlatList
          data={nearbyHotspots}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Ionicons name="wifi-outline" size={48} color={colors.textTertiary} />
              <Typography variant="body" color={colors.textSecondary} style={{ marginTop: 16, textAlign: 'center' }}>
                Aucun hotspot à proximité
              </Typography>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.listItem, { backgroundColor: colors.background }]}
              onPress={() => {
                // Navigate to hotspot detail
                router.push({ pathname: '/(app)/(user)/hotspot/[id]', params: { id: item.id } })
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Typography variant="h4">{item.name}</Typography>
                  {item.status === ENUMS.HOTSPOT_STATUS.ONLINE && (
                    <View style={[styles.badge, { backgroundColor: colors.success + '20', marginLeft: 8 }]}>
                      <View style={[styles.dot, { backgroundColor: colors.success }]} />
                      <Typography variant="caption" color={colors.success}>En ligne</Typography>
                    </View>
                  )}
                </View>
                <Typography variant="caption" color={colors.textSecondary} numberOfLines={1}>
                  {item.landmark}
                </Typography>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 }}>
                  <Typography variant="caption" style={{ fontWeight: '600' }}>À partir de 150 XOF</Typography>
                  {(item.distance !== undefined && item.distance >= 0) && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                      <Typography variant="caption" color={colors.textSecondary}>
                        {item.distance < 1000
                          ? `${item.distance.toFixed(0)} m`
                          : `${(item.distance / 1000).toFixed(1)} km`
                        }
                      </Typography>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden', // Ensures map corners match
    marginTop: -24, // Slight overlap if we wanted, but standard is fine
  },
  map: {
    width: '100%',
    height: '100%',
  },
  customMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapLoading: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 16, // Closer to bottom edge
    left: 16,
    right: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 6,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  floatingRecenter: {
    position: 'absolute',
    bottom: 180, // Higher up to avoid bottom sheet
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
})
