import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types/api';
import { handleDatabaseError } from '@/utils/errorHandler';

export const registerDevice = async (
  expoToken: string,
  platform: string
): Promise<ApiResponse<{ id: string }>> => {
  console.log('🔧 DeviceService: Starting device registration...');
  console.log('📱 Platform:', platform);
  console.log('🎯 Token length:', expoToken.length);
  
  try {
    console.log('💾 Inserting device into database...');
    const { error } = await supabase
      .from('devices')
      .insert([
        {
          expo_token: expoToken,
          platform,
        },
      ]);
    
    if (error) {
      console.log('❌ Database insert error:', error);
      throw error;
    }
    
    console.log('✅ Device inserted successfully');
    
    // Fetch the device by expo_token to get its id
    console.log('🔍 Fetching device ID from database...');
    const { data, error: fetchError } = await supabase
      .from('devices')
      .select('id')
      .eq('expo_token', expoToken)
      .single();
      
    if (fetchError) {
      console.log('❌ Database fetch error:', fetchError);
      throw fetchError;
    }
    
    console.log('✅ Device ID fetched:', data.id);
    return { success: true, data: { id: data.id } };
  } catch (error) {
    console.log('❌ DeviceService error:', error);
    return handleDatabaseError(error);
  }
}; 