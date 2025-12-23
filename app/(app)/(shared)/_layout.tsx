import { Stack } from 'expo-router'

export default function SharedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="settings" />
      <Stack.Screen name="support" />
      <Stack.Screen name="legal" />
      <Stack.Screen name="about" />
      <Stack.Screen name="transaction-detail/[id]" />
    </Stack>
  )
}
