import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="rooms" options={{ headerShown: false }} />
      <Stack.Screen name="update-room/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}