import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/components/ui/Toast';
import { loadFonts } from '@/lib/fonts';
import React from 'react';
import { GlobalProvider } from '@/components/GlobalContext';
import { RefreshProvider } from '@/components/RefreshContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setupNotifications } from '@/utils/notificationSetup';
import CustomSplashScreen from '@/components/CustomSplashScreen';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

// Custom theme configuration
const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2563eb',
    background: '#ffffff',
    card: '#ffffff',
    text: '#1e293b',
    border: '#e2e8f0',
    notification: '#2563eb',
  },
};

const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#3b82f6',
    background: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    border: '#334155',
    notification: '#3b82f6',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    async function prepare() {
      try {
        await loadFonts();
        await setupNotifications();
        setFontsLoaded(true);
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();

    // Listen for push notification taps
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data && data.id) {
        router.push({ pathname: '/emergency-details', params: { id: String(data.id) } });
      }
    });
    return () => subscription.remove();
  }, []);

  // When both fonts are loaded and splash is done, hide native splash
  const handleCustomSplashComplete = async () => {
    setShowSplash(false);
    await SplashScreen.hideAsync();
  };

  if (!fontsLoaded || showSplash) {
    return (
      <CustomSplashScreen onComplete={handleCustomSplashComplete} duration={3000} />
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? darkTheme : lightTheme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <RefreshProvider>
          <GlobalProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
                animationDuration: 200,
              }}
              // Remove splash as initial route
            >
              {/* <Stack.Screen name="splash" /> */}
              <Stack.Screen name="index" />
              <Stack.Screen 
                name="(tabs)" 
                options={{
                  animation: 'fade',
                }}
              />
              <Stack.Screen
              name="emergency-report"
              options={{
                presentation: 'modal',
              }}
              />
            </Stack>
            <Toast config={toastConfig} />
          </GlobalProvider>
        </RefreshProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
