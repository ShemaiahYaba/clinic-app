import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { getActiveAlerts } from '@/utils/database';

// Fetch device info and update state
export async function fetchDeviceInfo(setDeviceName: (name: string | null) => void, setDeviceId: (id: string | null) => void) {
  // Try to get device name and id from local cache first
  const cachedDeviceName = await AsyncStorage.getItem('device_name');
  const cachedDeviceId = await AsyncStorage.getItem('device_id');
  if (cachedDeviceName) {
    setDeviceName(cachedDeviceName);
  }
  if (cachedDeviceId) {
    setDeviceId(cachedDeviceId);
  }

  // Always try to fetch latest from Supabase if device_id exists
  if (!cachedDeviceId) {
    setDeviceName(null);
    setDeviceId(null);
    return;
  }
  const { data, error } = await supabase
    .from('devices')
    .select('id, device_name')
    .eq('id', cachedDeviceId)
    .single();
  if (error || !data) {
    // If fetch fails, keep showing cached values
    return;
  } else {
    setDeviceName(data.device_name);
    setDeviceId(data.id);
    // Store device id and name locally for offline use
    await AsyncStorage.setItem('device_id', data.id);
    await AsyncStorage.setItem('device_name', data.device_name);
  }
}

// Fetch all alerts and update state (updated to use new database functions)
export async function fetchAlerts(setAlerts: (alerts: any[]) => void) {
  try {
    const result = await getActiveAlerts();
    if (result.success && result.data) {
      setAlerts(result.data);
    } else {
      setAlerts([]);
    }
  } catch (error) {
    setAlerts([]);
  }
}

// Fetch latest emergency and update state (updated to use new database functions)
export async function fetchLatestEmergency(setLatestEmergency: (alert: any | null) => void) {
  try {
    const result = await getActiveAlerts();
    if (result.success && result.data && result.data.length > 0) {
      setLatestEmergency(result.data[0]);
    } else {
      setLatestEmergency(null);
    }
  } catch (error) {
    setLatestEmergency(null);
  }
} 