import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useColorScheme } from 'react-native'

export default function AdminLayout() {
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
      {/* Main admin tabs */}
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="users" 
        options={{ 
          title: 'Utilisateurs',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="kyc" 
        options={{ 
          title: 'KYC',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark" size={size} color={color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="payouts" 
        options={{ 
          title: 'Paiements',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash" size={size} color={color} />
          )
        }} 
      />
    </Tabs>
  )
}
