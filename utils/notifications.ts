import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabaseClient';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerDevice(userId: string) {
  if (!Device.isDevice) return;

  // Handle web platform separately
  if (Platform.OS === 'web') {
    try {
      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId: 'c90572c1-39a6-414b-9547-eac1231e32e6' // Your Expo project ID
      });
      await supabase.from('devices').insert([{ user_id: userId, expo_token: token }]);
    } catch (error) {
      console.error('Error registering web device:', error);
    }
    return;
  }

  // Handle mobile platforms
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await supabase.from('devices').insert([{ user_id: userId, expo_token: token }]);
}

export function setupForegroundNotificationListener() {
  return Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received in foreground:', notification);
    // You can display a toast or update UI here
  });
} 