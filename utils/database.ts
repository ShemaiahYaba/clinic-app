import { supabase } from './supabaseClient';

// Device Management
export const updateDeviceToken = async (userId: string, newToken: string) => {
  const { error } = await supabase
    .from('devices')
    .update({ expo_token: newToken })
    .eq('user_id', userId);
  return { error };
};

export const deleteDevice = async (userId: string) => {
  const { error } = await supabase
    .from('devices')
    .delete()
    .eq('user_id', userId);
  return { error };
};

// Alert Management
export const getRecentAlerts = async (limit = 10) => {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data, error };
};

export const getUserAlerts = async (userId: string) => {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('sender_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

// Utility Functions
export const withRetry = async (operation: () => Promise<any>, maxRetries = 3) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw lastError;
};

export const batchInsertDevices = async (devices: Array<{ user_id: string, expo_token: string }>) => {
  const { data, error } = await supabase
    .from('devices')
    .insert(devices);
  return { data, error };
};

export const validateAlert = (alert: { sender_id: string, message?: string }) => {
  if (!alert.sender_id) throw new Error('Sender ID is required');
  if (alert.message && alert.message.length > 500) throw new Error('Message too long');
  return true;
}; 