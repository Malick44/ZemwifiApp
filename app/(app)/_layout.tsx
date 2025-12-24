import { Stack } from 'expo-router'

export default function AppLayout() {
  // All users see the (user) tabs, which conditionally shows role-specific tabs
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(user)" />
      <Stack.Screen name="(host)" options={{ headerShown: false }} />
      <Stack.Screen name="(technician)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      <Stack.Screen name="(shared)" />
    </Stack>
  )
}
