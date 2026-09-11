import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { initStore, useAppStore } from '../src/store/appStore';
import { initNotifications } from '../src/services/notificationService';
import { initAnalytics } from '../src/services/analyticsService';
import { useTheme } from '../src/hooks/useTheme';

const ONBOARDING_KEY = 'onboarding_done_v1';

export default function RootLayout() {
  const { isDark, colors } = useTheme();
  const router = useRouter();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function bootstrap() {
      initAnalytics();
      await initStore();
      initNotifications(useAppStore.getState().language);
      try {
        const done = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (!done) {
          router.replace('/onboarding');
        }
      } catch {}
    }
    bootstrap();

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const screen = response.notification.request.content.data?.screen as string | undefined;
      if (screen) router.push(screen as any);
    });
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="add-pet" />
        <Stack.Screen name="translate/[petId]" />
        <Stack.Screen name="result/[id]" />
        <Stack.Screen name="article/[id]" />
      </Stack>
    </GestureHandlerRootView>
  );
}
