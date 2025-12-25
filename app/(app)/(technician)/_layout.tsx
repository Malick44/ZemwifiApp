import { Stack } from 'expo-router'

export default function TechnicianLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="wallet/index" />
      <Stack.Screen name="wallet/[voucherId]" />
      <Stack.Screen name="wallet/topup-qr" />
      <Stack.Screen name="wallet/topup-requests/index" />
      <Stack.Screen name="wallet/topup-requests/[id]" />
    </Stack>
  )
}
