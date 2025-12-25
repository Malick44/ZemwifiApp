import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useColorScheme } from 'react-native'
import { useAuthStore } from '../../../src/stores/authStore'

export default function UserTabs() {
  const colorScheme = useColorScheme()
  const iconColor = Colors[colorScheme ?? 'light'].text
  const activeColor = Colors[colorScheme ?? 'light'].tint
  const profile = useAuthStore((s) => s.profile)
  const role = profile?.role || 'user'

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: iconColor,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors[colorScheme ?? 'light'].border,
        }
      }}
    >
      {/* Main 4 tabs */}
      <Tabs.Screen
        name="map"
        options={{
          title: 'Découvrir',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="wallet/index"
        options={{
          title: 'Portefeuille',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historique',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          )
        }}
      />

      {/* Conditional role-based tabs - always render but hide with href: null */}
      <Tabs.Screen
        name="host-tab"
        options={{
          title: 'Hôte',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
          href: role === 'host' ? '/(app)/(user)/host-tab' : null
        }}
      />
      <Tabs.Screen
        name="admin-tab"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark" size={size} color={color} />
          ),
          href: role === 'admin' ? '/(app)/(user)/admin-tab' : null
        }}
      />
      <Tabs.Screen
        name="tech-tab"
        options={{
          title: 'Tech',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="construct" size={size} color={color} />
          ),
          href: role === 'technician' ? '/(app)/(user)/tech-tab' : null
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Réglages',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          )
        }}
      />

      {/* Hide all nested/detail routes from tabs */}
      <Tabs.Screen name="list" options={{ href: null }} />
      <Tabs.Screen name="connect-help" options={{ href: null }} />
      <Tabs.Screen name="hotspot/[id]" options={{ href: null }} />
      <Tabs.Screen name="payment/method" options={{ href: null }} />
      <Tabs.Screen name="payment/status" options={{ href: null }} />
      <Tabs.Screen name="payment/success" options={{ href: null }} />
      <Tabs.Screen name="wallet/[voucherId]" options={{ href: null }} />
      <Tabs.Screen name="wallet/topup-qr" options={{ href: null }} />
      <Tabs.Screen name="wallet/topup-requests/index" options={{ href: null }} />
      <Tabs.Screen name="wallet/topup-requests/[id]" options={{ href: null }} />
      <Tabs.Screen name="technician-dashboard" options={{ href: null }} />
      <Tabs.Screen name="host-dashboard" options={{ href: null }} />
    </Tabs>
  )
}
