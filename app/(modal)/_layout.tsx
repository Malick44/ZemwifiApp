import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="plan-editor"
        options={{
          title: 'Éditeur de plan',
        }}
      />
      <Stack.Screen
        name="qr"
        options={{
          title: 'QR Code',
        }}
      />
    </Stack>
  );
}
