import { Stack } from 'expo-router'
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { useAuthStore } from '../src/stores/authStore'

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const refresh = useAuthStore((s) => s.refreshSession)
  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="(modal)" options={{ presentation: 'modal' }} />
        <Stack.Screen name="index" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  )
}
