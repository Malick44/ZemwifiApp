import { Stack } from 'expo-router'

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(user)" />
      <Stack.Screen name="(host)" />
      <Stack.Screen name="(technician)" />
      <Stack.Screen name="(shared)" />
    </Stack>
  )
}
