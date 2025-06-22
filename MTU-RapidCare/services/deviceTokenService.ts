import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';
import { STORAGE_KEYS } from '@/config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleApiError } from '@/utils/errorHandler';
import { ApiResponse } from '@/types/api';

export class DeviceTokenService {
  private static instance: DeviceTokenService;
  
  private constructor() {}
  
  static getInstance(): DeviceTokenService {
    if (!DeviceTokenService.instance) {
      DeviceTokenService.instance = new DeviceTokenService();
    }
    return DeviceTokenService.instance;
  }

  async requestNotificationPermissions(): Promise<boolean> {
    try {
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

  async registerDeviceToken(userId: string): Promise<ApiResponse<string | null>> {
    try {
      if (Platform.OS === 'web') {
        return { success: true, data: null };
      }

      const hasPermission = await this.requestNotificationPermissions();
      if (!hasPermission) {
        return { success: false, error: 'Notification permissions not granted' };
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      
      if (!token) {
        return { success: false, error: 'No push token available' };
      }

      // Store token in AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_TOKEN, token);

      // Update or create device record in database
      const { error: dbError } = await supabase
        .from('devices')
        .upsert({
          user_id: userId,
          expo_token: token,
          updated_at: new Date().toISOString()
        });

      if (dbError) {
        throw dbError;
      }

      return { success: true, data: token };
    } catch (error) {
      return handleApiError(error) as ApiResponse<string | null>;
    }
  }

  async updateDeviceToken(userId: string, token: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('devices')
        .update({ expo_token: token, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return handleApiError(error);
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_TOKEN);
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }
} 