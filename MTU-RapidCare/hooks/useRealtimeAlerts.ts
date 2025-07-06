import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { ERROR_MESSAGES } from '@/config/constants';
import { useGlobal } from '@/components/GlobalContext';
import { handleNetworkError } from '@/utils/errorHandler';

interface AlertPayload {
  new: {
    id: string;
    sender_device_id: string;
    message: string;
    created_at: string;
    status: string;
  };
}

export const useRealtimeAlerts = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [reconnectTimerRef, setReconnectTimerRef] = useState<NodeJS.Timeout | null>(null);
  const { setEmergencyAlert } = useGlobal();

  useEffect(() => {
    let subscription: any;

    const setupRealtimeSubscription = async () => {
      try {
        // Temporarily disable Supabase auth check for UI testing
        // const { data: { user } } = await supabase.auth.getUser();
        // if (!user) return;
        
        // For now, just set connected to true for UI testing
        setIsConnected(true);
        return;

        // Subscribe to new alerts
        subscription = supabase
          .channel('alerts')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'alerts',
            },
            async (payload: RealtimePostgresChangesPayload<AlertPayload>) => {
              console.log('New alert received:', payload);
              
              const alertData = payload.new as AlertPayload['new'];
              if (alertData && alertData.status === 'active') {
                // Update global state
                setEmergencyAlert(true, alertData.message, alertData.sender_device_id);

                // Trigger notification
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: 'Emergency Alert',
                    body: alertData.message,
                    data: {
                      id: alertData.id,
                      sender_device_id: alertData.sender_device_id,
                      message: alertData.message,
                      created_at: alertData.created_at
                    },
                  },
                  trigger: null,
                });
              }
            }
          )
          .subscribe((status: string) => {
            console.log('Subscription status:', status);
            setIsConnected(status === 'SUBSCRIBED');
          });

        // Handle connection errors
        subscription.on('error', (error: any) => {
          handleNetworkError(error);
          setIsConnected(false);
          scheduleReconnect();
        });

      } catch (error) {
        handleNetworkError(error);
        setIsConnected(false);
        scheduleReconnect();
      }
    };

    const scheduleReconnect = () => {
      if (reconnectTimerRef) {
        clearTimeout(reconnectTimerRef);
      }

      const timer = setTimeout(() => {
        console.log('Attempting to reconnect...');
        setupRealtimeSubscription();
      }, 5000); // 5 second delay

      setReconnectTimerRef(timer as unknown as NodeJS.Timeout);
    };

    setupRealtimeSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (reconnectTimerRef) {
        clearTimeout(reconnectTimerRef);
      }
    };
  }, [setEmergencyAlert]);

  return { isConnected };
};
