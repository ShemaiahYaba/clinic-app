import { useCallback } from 'react';
import { useGlobal } from '@/components/GlobalContext';
import { EmergencyAlertData } from '@/types/api';
import { handleApiError, handleEmergencyError } from '@/utils/errorHandler';
import { ApiResponse } from '@/types/api';
import { supabase } from '@/lib/supabase';
import { CONFIG } from '@/config/constants';

export const useEmergencyAlert = () => {
  const { setEmergencyAlert, getEmergencyState } = useGlobal();

  const triggerEmergency = useCallback(async (message: string): Promise<ApiResponse<EmergencyAlertData>> => {
    try {
      // Temporarily disable Supabase auth for UI testing
      // const { data: { session } } = await supabase.auth.getSession();
      // if (!session?.access_token) {
      //   throw new Error('No active session');
      // }

      // Simulate successful response for UI testing
      const mockAlert = {
        id: 'mock-alert-id',
        message,
        status: 'active' as const,
        created_at: new Date().toISOString(),
        sender_id: 'mock-user-id'
      };

      // Update local state
      setEmergencyAlert(true, message, 'mock-user-id');

      return {
        success: true,
        data: mockAlert
      };
    } catch (error) {
      return handleEmergencyError(error) as ApiResponse<EmergencyAlertData>;
    }
  }, [setEmergencyAlert]);

  const resolveEmergency = useCallback(async (alertId: string): Promise<ApiResponse<void>> => {
    try {
      // Temporarily disable Supabase auth for UI testing
      // const { data: { session } } = await supabase.auth.getSession();
      // if (!session?.access_token) {
      //   throw new Error('No active session');
      // }

      // Simulate successful resolution for UI testing
      // const { error: dbError } = await supabase
      //   .from('alerts')
      //   .update({ status: 'resolved' })
      //   .eq('id', alertId);

      // if (dbError) throw dbError;

      // Clear local state
      setEmergencyAlert(false);

      return {
        success: true
      };
    } catch (error) {
      return handleEmergencyError(error) as ApiResponse<void>;
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
      return handleEmergencyError(error) as ApiResponse<EmergencyAlertData | null>;
    }
  }, [getEmergencyState]);

  return {
    triggerEmergency,
    resolveEmergency,
    getCurrentEmergencyState
  };
}; 