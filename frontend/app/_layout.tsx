
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="create-trip" />
      <Stack.Screen name="create-post" />
      <Stack.Screen name="attraction" />
      <Stack.Screen name="saved" />
    </Stack>
  );
}
