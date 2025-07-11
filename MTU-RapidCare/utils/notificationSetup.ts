import * as Notifications from 'expo-notifications';
import { Platform, Vibration } from 'react-native';

export const setupNotifications = async () => {
  // Set up notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => {
      // Vibrate when a notification is received
      Vibration.vibrate([0, 250, 250, 250]);
      return {
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      };
    },
  });

  // Set up Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'emergency_alert.wav', // Use custom sound 'emergency_alert.wav'
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}; 