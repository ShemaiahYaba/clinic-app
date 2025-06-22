import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { ERROR_MESSAGES } from '@/config/constants';
import { useGlobal } from '@/components/GlobalSearch';

interface AlertPayload {
  new: {
    id: string;
    sender_id: string;
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
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

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
                setEmergencyAlert(true, alertData.message, alertData.sender_id);

                // Trigger notification
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: 'Emergency Alert',
                    body: alertData.message,
                    data: {
                      id: alertData.id,
                      sender_id: alertData.sender_id,
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
          console.error('Subscription error:', error);
          setIsConnected(false);
          scheduleReconnect();
        });

      } catch (error) {
        console.error('Error setting up realtime subscription:', error);
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
