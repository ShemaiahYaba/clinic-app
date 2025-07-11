import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { getActiveAlerts } from '@/utils/database';

// Fetch device info and update state
export async function fetchDeviceInfo(setDeviceName: (name: string | null) => void, setDeviceId: (id: string | null) => void) {
  const id = await AsyncStorage.getItem('device_id');
  if (!id) {
    setDeviceName(null);
    setDeviceId(null);
    return;
  }
  const { data, error } = await supabase
    .from('devices')
    .select('id, device_name')
    .eq('id', id)
    .single();
  if (error || !data) {
    setDeviceName(null);
    setDeviceId(null);
  } else {
    setDeviceName(data.device_name);
    setDeviceId(data.id);
    // Store device id locally for offline use
    await AsyncStorage.setItem('device_id', data.id);
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