import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '@/utils/supabaseClient';
import { EXPO_PROJECT_ID, NOTIFICATION_CHANNEL } from '@/constants/config';

export async function getExpoPushToken(): Promise<string | null> {
  try {
    // For web platform, we'll skip push notifications for now
    if (Platform.OS === 'web') {
      console.log('Push notifications not supported in web environment');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(
        NOTIFICATION_CHANNEL.id,
        {
          name: NOTIFICATION_CHANNEL.name,
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [...NOTIFICATION_CHANNEL.vibrationPattern],
          lightColor: NOTIFICATION_CHANNEL.lightColor,
        }
      );
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: EXPO_PROJECT_ID
    });

    return token;
  } catch (error) {
    console.error('Error getting Expo push token:', error);
    return null;
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    // For web platform, we'll skip permission request
    if (Platform.OS === 'web') {
      console.log('Push notifications not supported in web environment');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

export async function registerDeviceToken(userId: string): Promise<string | null> {
  try {
    console.log('Starting device registration for user:', userId);
    
    // For web platform, we'll skip device registration
    if (Platform.OS === 'web') {
      console.log('Device registration skipped in web environment');
      return null;
    }
    
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return null;
    }

    const token = await getExpoPushToken();
    if (!token) {
      console.warn('No push token available');
      return null;
    }
    
    console.log('Got Expo push token:', token);
    
    // First, check if a device record already exists
    const { data: existingDevice, error: fetchError } = await supabase
      .from('devices')
      .select('id, expo_token')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking existing device:', fetchError);
      throw fetchError;
    }

    if (existingDevice) {
      // Update existing device
      console.log('Updating existing device record');
      const { error: updateError } = await supabase
        .from('devices')
        .update({ 
          expo_token: token,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingDevice.id);

      if (updateError) {
        console.error('Error updating device:', updateError);
        throw updateError;
      }
    } else {
      // Insert new device
      console.log('Creating new device record');
      const { error: insertError } = await supabase
        .from('devices')
        .insert([{ 
          user_id: userId, 
          expo_token: token,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error('Error inserting device:', insertError);
        throw insertError;
      }
    }

    console.log('Device registration completed successfully');
    return token;
  } catch (error: any) {
    console.error('Device registration error:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    return null;
  }
}

export async function updateDeviceToken(userId: string, newToken: string): Promise<boolean> {
  try {
    // For web platform, we'll skip token update
    if (Platform.OS === 'web') {
      console.log('Device token update skipped in web environment');
      return true;
    }

    console.log('Updating device token for user:', userId);
    
    const { error } = await supabase
      .from('devices')
      .update({ 
        expo_token: newToken,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating device token:', error);
      throw error;
    }

    console.log('Device token updated successfully');
    return true;
  } catch (error: any) {
    console.error('Error updating device token:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    return false;
  }
}

export async function deleteDevice(userId: string): Promise<boolean> {
  try {
    console.log('Deleting device for user:', userId);
    
    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting device:', error);
      throw error;
    }

    console.log('Device deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting device:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    return false;
  }
} 