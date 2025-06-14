import { useEffect } from 'react';
import { supabase } from "@/utils/supabaseClient";
import * as Notifications from 'expo-notifications';

export function useRealtimeAlerts() {
  useEffect(() => {
    const channel = supabase
      .channel('public:alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
        },
        async (payload: { new: { message?: string } }) => {
          console.log('🚨 Emergency Alert Received', payload);

          await Notifications.scheduleNotificationAsync({
            content: {
              title: '🚨 Emergency Alert',
              body: payload.new.message || 'An emergency was triggered!',
              sound: 'default',
              data: { type: 'EMERGENCY_ALERT' },
            },
            trigger: null,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
