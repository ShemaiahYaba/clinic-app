import { useState, useEffect } from 'react';
import { useRealtimeAlerts } from './useRealtimeAlerts';

export const useNetworkStatus = () => {
  const { isConnected: realtimeConnected } = useRealtimeAlerts();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Use the realtime connection status as a proxy for network connectivity
    setIsOnline(realtimeConnected);
  }, [realtimeConnected]);

  return { isOnline };
}; 