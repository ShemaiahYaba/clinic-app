import { useCallback } from 'react';
import { useGlobal } from '@/components/GlobalSearch';
import { EmergencyAlertData } from '@/types/api';
import { handleApiError } from '@/utils/error';
import { ApiResponse } from '@/types/api';
import { supabase } from '@/lib/supabase';
import { CONFIG } from '@/config/constants';

export const useEmergencyAlert = () => {
  const { setEmergencyAlert, getEmergencyState } = useGlobal();

  const triggerEmergency = useCallback(async (message: string): Promise<ApiResponse<EmergencyAlertData>> => {
    try {
      // Get current session for auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      // Insert alert into database
      const { data: alert, error: dbError } = await supabase
        .from('alerts')
        .insert([{ message, status: 'active' }])
        .select()
        .single();

      if (dbError) throw dbError;

      // Send notifications via edge function
      const response = await fetch(`${CONFIG.EDGE_FUNCTION_URL}/send-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ alertId: alert.id })
      });

      if (!response.ok) {
        throw new Error('Failed to send notifications');
      }

      // Update local state
      setEmergencyAlert(true, message, session.user.id);

      return {
        success: true,
        data: alert
      };
    } catch (error) {
      return handleApiError(error);
    }
  }, [setEmergencyAlert]);

  const resolveEmergency = useCallback(async (alertId: string): Promise<ApiResponse<void>> => {
    try {
      // Get current session for auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      // Update alert status
      const { error: dbError } = await supabase
        .from('alerts')
        .update({ status: 'resolved' })
        .eq('id', alertId);

      if (dbError) throw dbError;

      // Clear local state
      setEmergencyAlert(false);

      return {
        success: true
      };
    } catch (error) {
      return handleApiError(error);
    }
  }, [setEmergencyAlert]);

  const getCurrentEmergencyState = useCallback(async (): Promise<ApiResponse<EmergencyAlertData | null>> => {
    try {
      const state = await getEmergencyState();
      return {
        success: true,
        data: state
      };
    } catch (error) {
      return handleApiError(error);
    }
  }, [getEmergencyState]);

  return {
    triggerEmergency,
    resolveEmergency,
    getCurrentEmergencyState
  };
}; 