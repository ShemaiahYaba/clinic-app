import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types/api';
import { handleDatabaseError } from '@/utils/errorHandler';
import { CONFIG } from '@/config/constants';

const EDGE_FUNCTION_URL = CONFIG.EDGE_FUNCTION_URL || "https://oxhjrszqngdyvbixxyvo.supabase.co/functions/v1/send-push-alert";

// Emergency Alert Management (merged DB + notification)
export const triggerEmergencyAlert = async (
  senderDeviceId: string,
  message: string,
  location?: string,
  extraData?: any
): Promise<ApiResponse<any>> => {
  console.log('triggerEmergencyAlert called', { senderDeviceId, message, location, extraData });
  console.trace('triggerEmergencyAlert stack trace');
  try {
    // 1. Insert into database
    const { data, error } = await supabase
      .from('alerts')
      .insert([
        {
          sender_device_id: senderDeviceId,
          message,
          location,
          status: 'active',
          extra_data: extraData || null,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // 2. Trigger notification with proper authentication
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };

      // Add authorization header if service role key is available
      if (CONFIG.SUPABASE_SERVICE_ROLE_KEY && CONFIG.SUPABASE_SERVICE_ROLE_KEY !== 'your-service-role-key-here') {
        headers["Authorization"] = `Bearer ${CONFIG.SUPABASE_SERVICE_ROLE_KEY}`;
        console.log('Using service role key for notification');
      } else {
        console.warn('Service role key not available, notification may fail');
      }

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          sender_device_id: senderDeviceId,
          message,
          location,
          extra_data: extraData
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('Notification failed but alert was created:', errorText);
        
        // Log more details for debugging
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      } else {
        console.log('Notification sent successfully');
      }
    } catch (notificationError) {
      console.warn('Notification error (alert still created):', notificationError);
    }

    return { success: true, data };
  } catch (error: any) {
    return handleDatabaseError(error);
  }
};

export const getActiveAlerts = async (): Promise<ApiResponse<any[]>> => {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    return handleDatabaseError(error);
  }
};

export const resolveAlert = async (alertId: string): Promise<ApiResponse<void>> => {
  try {
    console.log('Database: Resolving alert with ID:', alertId);
    const { error } = await supabase
      .from('alerts')
      .update({ 
        status: 'resolved',
        resolved_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Database: Alert resolved successfully');
    return {
      success: true
    };
  } catch (error) {
    console.error('Database: Error in resolveAlert:', error);
    return handleDatabaseError(error) as ApiResponse<void>;
  }
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