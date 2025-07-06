import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types/api';
import { handleDatabaseError } from '@/utils/errorHandler';

export const registerDevice = async (
  expoToken: string,
  platform: string
): Promise<ApiResponse<{ id: string }>> => {
  try {
    const { error } = await supabase
      .from('devices')
      .insert([
        {
          expo_token: expoToken,
          platform,
        },
      ]);
    if (error) throw error;
    // Fetch the device by expo_token to get its id
    const { data, error: fetchError } = await supabase
      .from('devices')
      .select('id')
      .eq('expo_token', expoToken)
      .single();
    if (fetchError) throw fetchError;
    return { success: true, data: { id: data.id } };
  } catch (error) {
    return handleDatabaseError(error);
  }
}; 