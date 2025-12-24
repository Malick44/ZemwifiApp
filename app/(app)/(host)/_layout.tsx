import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useColorScheme } from 'react-native'

export default function HostLayout() {
  const colorScheme = useColorScheme()
  const iconColor = Colors[colorScheme ?? 'light'].text
  const activeColor = Colors[colorScheme ?? 'light'].tint

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
      {/* Main host tabs */}
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          title: 'Tableau de bord',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="hotspots" 
        options={{ 
          title: 'Hotspots',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wifi" size={size} color={color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="cashin" 
        options={{ 
          title: 'Recharge',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" size={size} color={color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="earnings" 
        options={{ 
          title: 'Revenus',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash" size={size} color={color} />
          )
        }} 
      />

      {/* Hide detail/nested screens from tabs */}
      <Tabs.Screen name="start" options={{ href: null }} />
      <Tabs.Screen name="kyc" options={{ href: null }} />
      <Tabs.Screen name="claim" options={{ href: null }} />
      <Tabs.Screen name="setup" options={{ href: null }} />
      <Tabs.Screen name="hotspot/[id]" options={{ href: null }} />
      <Tabs.Screen name="sessions" options={{ href: null }} />
      <Tabs.Screen name="payouts" options={{ href: null }} />
      <Tabs.Screen name="cashin-history" options={{ href: null }} />
      <Tabs.Screen name="technician-requests/index" options={{ href: null }} />
      <Tabs.Screen name="technician-requests/new" options={{ href: null }} />
      <Tabs.Screen name="technician-requests/[id]" options={{ href: null }} />
    </Tabs>
  )
}
