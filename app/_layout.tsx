import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { DevPanel } from '../components/DevPanel'
import { useAuthStore } from '../src/stores/authStore'

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const refresh = useAuthStore((s) => s.refreshSession)
  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="(modal)" options={{ presentation: 'modal' }} />
          <Stack.Screen name="index" />
        </Stack>
        <StatusBar style="auto" />
        <DevPanel />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
