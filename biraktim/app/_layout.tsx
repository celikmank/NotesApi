import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { fontMap } from '../src/theme/fonts';
import { getDb } from '../src/db';
import { applyDeviceLocale } from '../src/i18n';
import { getSetting, SETTINGS_KEYS } from '../src/db/settings';
import { PremiumProvider } from '../src/state/PremiumContext';
import { colors } from '../src/theme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts(fontMap);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    void (async () => {
      await getDb();
      const lang = await getSetting(SETTINGS_KEYS.language);
      applyDeviceLocale(lang ?? undefined);
      setDbReady(true);
    })();
  }, []);

  useEffect(() => {
    if (fontsLoaded && dbReady) void SplashScreen.hideAsync();
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded || !dbReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PremiumProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(main)" />
            <Stack.Screen name="paywall" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="relapse" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="sos" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          </Stack>
        </PremiumProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
