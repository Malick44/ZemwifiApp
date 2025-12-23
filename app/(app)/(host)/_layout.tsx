import { Stack } from 'expo-router'

export default function HostLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="start" />
      <Stack.Screen name="kyc" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="claim" />
      <Stack.Screen name="setup" />
      <Stack.Screen name="hotspots" />
      <Stack.Screen name="hotspot/[id]" />
      <Stack.Screen name="sessions" />
      <Stack.Screen name="earnings" />
      <Stack.Screen name="payouts" />
      <Stack.Screen name="cashin" />
      <Stack.Screen name="cashin-history" />
      <Stack.Screen name="technician-requests/index" />
      <Stack.Screen name="technician-requests/new" />
      <Stack.Screen name="technician-requests/[id]" />
    </Stack>
  )
}
