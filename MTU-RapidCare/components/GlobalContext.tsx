import React, { createContext, useState, useContext, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/config/constants';
import { EmergencyAlertData } from '@/types/api';
import { supabase } from '@/lib/supabase';
import { triggerEmergencyAlert, getActiveAlerts, resolveAlert } from '@/utils/database';

// Define types for our emergency alert system
interface EmergencyAlert {
  id?: string;
  isActive: boolean;
  timestamp: number | null;
  details: string;
  isSender: boolean;
  receivedFrom?: string;
  status?: string;
  location?: string;
  resolved_at?: string;
}

export type { EmergencyAlert };

interface GlobalState {
  hostelname: string;
  sickness: string;
  emergencyAlerts: EmergencyAlertData[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

interface GlobalContextType extends GlobalState {
  setHostelname: (name: string) => Promise<void>;
  setSickness: (condition: string) => Promise<void>;
  addEmergencyAlert: (alert: EmergencyAlertData) => Promise<void>;
  clearEmergencyAlerts: () => Promise<void>;
  resolveEmergencyAlert: (alertId: string) => Promise<void>;
  initializeState: () => Promise<void>;
  resetError: () => void;
  refreshAlerts: () => Promise<void>;
}

const DEFAULT_STATE: GlobalState = {
  hostelname: '',
  sickness: '',
  emergencyAlerts: [],
  isLoading: false,
  error: null,
  isConnected: true
};

// Create context with undefined default value
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

/**
 * Global state provider component for the application
 */
export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GlobalState>(DEFAULT_STATE);

  // Set hostel name and persist to storage
  const setHostelname = useCallback(async (name: string) => {
    try {
      setState(prevState => ({ ...prevState, isLoading: true, error: null }));
      await AsyncStorage.setItem(STORAGE_KEYS.HOSTEL_NAME, name);
      setState(prevState => ({ 
        ...prevState, 
        hostelname: name,
        isLoading: false 
      }));
    } catch (error) {
      setState(prevState => ({ 
        ...prevState, 
        isLoading: false,
        error: 'Failed to save hostel selection' 
      }));
      throw error;
    }
  }, []);

  // Set sickness condition and persist to storage
  const setSickness = useCallback(async (condition: string) => {
    try {
      setState(prevState => ({ ...prevState, isLoading: true, error: null }));
      await AsyncStorage.setItem(STORAGE_KEYS.SICKNESS, condition);
      setState(prevState => ({ 
        ...prevState, 
        sickness: condition,
        isLoading: false 
      }));
    } catch (error) {
      setState(prevState => ({ 
        ...prevState, 
        isLoading: false,
        error: 'Failed to save medical condition' 
      }));
      throw error;
    }
  }, []);

  // Load alerts from AsyncStorage and DB
  const initializeState = useCallback(async () => {
    try {
      setState(prevState => ({ ...prevState, isLoading: true, error: null }));
      const [hostelname, sickness, storedAlerts] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.HOSTEL_NAME),
        AsyncStorage.getItem(STORAGE_KEYS.SICKNESS),
        AsyncStorage.getItem('emergency_alerts'),
      ]);
      let emergencyAlerts: EmergencyAlertData[] = storedAlerts ? JSON.parse(storedAlerts) : [];
      // Load active alerts from database
      const alertsResult = await getActiveAlerts();
      if (alertsResult.success && alertsResult.data) {
        emergencyAlerts = alertsResult.data;
      }
      setState(prevState => ({
        ...prevState,
        hostelname: hostelname || '',
        sickness: sickness || '',
        emergencyAlerts,
        isLoading: false,
        isConnected: true
      }));
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: 'Failed to load application state',
        isConnected: false
      }));
    }
  }, []);

  // Real-time subscription
  useEffect(() => {
    let subscription: any;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    const setupRealtimeSubscription = async () => {
      try {
        if (subscription) subscription.unsubscribe();
        subscription = supabase
          .channel('alerts')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, async (payload) => {
            if (payload.eventType === 'INSERT') {
              const newAlert = payload.new as EmergencyAlertData;
              setState(prevState => {
                const filtered = prevState.emergencyAlerts.filter(a => a.id !== newAlert.id && !a.pending);
                return { ...prevState, emergencyAlerts: [newAlert, ...filtered] };
              });
            } else if (payload.eventType === 'UPDATE') {
              const updatedAlert = payload.new as EmergencyAlertData;
              setState(prevState => {
                const updated = prevState.emergencyAlerts.map(a => a.id === updatedAlert.id ? updatedAlert : a);
                return { ...prevState, emergencyAlerts: updated };
              });
            } else if (payload.eventType === 'DELETE') {
              const deletedId = payload.old.id;
              setState(prevState => ({
                ...prevState,
                emergencyAlerts: prevState.emergencyAlerts.filter(a => a.id !== deletedId)
              }));
            }
          })
          .subscribe();
      } catch (error) {
        setState(prevState => ({ ...prevState, isConnected: false }));
        reconnectTimer = setTimeout(setupRealtimeSubscription, 10000);
      }
    };
    setupRealtimeSubscription();
    return () => {
      if (subscription) subscription.unsubscribe();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  // Persist alerts to AsyncStorage
  useEffect(() => {
    AsyncStorage.setItem('emergency_alerts', JSON.stringify(state.emergencyAlerts));
  }, [state.emergencyAlerts]);

  // Add alert (optimistic UI)
  const addEmergencyAlert = useCallback(async (alert: EmergencyAlertData) => {
    setState(prevState => ({
      ...prevState,
      emergencyAlerts: [{
        ...alert,
        id: alert.id || Math.random().toString(36).slice(2),
        resolved_at: alert.resolved_at || undefined,
        pending: true
      }, ...prevState.emergencyAlerts],
    }));
  }, []);

  // Clear all alerts
  const clearEmergencyAlerts = useCallback(async () => {
    setState(prevState => ({ ...prevState, emergencyAlerts: [] }));
  }, []);

  // Resolve alert
  const resolveEmergencyAlert = useCallback(async (alertId: string) => {
    try {
      setState(prevState => ({ ...prevState, isLoading: true, error: null }));
      const result = await resolveAlert(alertId);
      if (!result.success) throw new Error(result.error || 'Failed to resolve alert');
      setState(prevState => ({ ...prevState, isLoading: false }));
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to resolve alert'
      }));
      throw error;
    }
  }, []);

  // Refresh alerts from DB
  const refreshAlerts = useCallback(async () => {
    try {
      const alertsResult = await getActiveAlerts();
      setState(prevState => ({
        ...prevState,
        emergencyAlerts: alertsResult.success && alertsResult.data ? alertsResult.data : [],
      }));
    } catch (error) {
      setState(prevState => ({ ...prevState, error: 'Failed to refresh alerts' }));
    }
  }, []);

  const resetError = useCallback(() => {
    setState(prevState => ({ ...prevState, error: null }));
  }, []);

  const contextValue = useMemo(() => ({
    ...state,
    setHostelname,
    setSickness,
    addEmergencyAlert,
    clearEmergencyAlerts,
    resolveEmergencyAlert,
    initializeState,
    resetError,
    refreshAlerts
  }), [state, setHostelname, setSickness, addEmergencyAlert, clearEmergencyAlerts, resolveEmergencyAlert, initializeState, resetError, refreshAlerts]);

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

/**
 * Hook to access global state
 */
export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};

/**
 * Specialized hook for emergency alert functionality
 */
export const useEmergencyAlert = () => {
  const { 
    emergencyAlerts, 
    addEmergencyAlert, 
    clearEmergencyAlerts,
    resolveEmergencyAlert,
    refreshAlerts,
    isConnected
  } = useGlobal();

  const triggerEmergencyAlert = useCallback(async (details?: string, location?: string) => {
    await addEmergencyAlert({
      id: Math.random().toString(36).slice(2),
      message: details || 'Emergency alert triggered',
      status: 'active',
      location: location,
      sender_device_id: '',
      created_at: new Date().toISOString(),
      resolved_at: undefined,
      pending: true,
    });
  }, [addEmergencyAlert]);

  const receiveEmergencyAlert = useCallback(async (details?: string, senderId?: string) => {
    await addEmergencyAlert({
      id: Math.random().toString(36).slice(2),
      message: details || 'Emergency alert received',
      status: 'active',
      location: senderId,
      sender_device_id: '',
      created_at: new Date().toISOString(),
      resolved_at: undefined,
      pending: true,
    });
  }, [addEmergencyAlert]);

  const handleEmergencyAlert = useCallback(async () => {
    await clearEmergencyAlerts();
  }, [clearEmergencyAlerts]);

  const handleResolveAlert = useCallback(async (alertId: string) => {
    await resolveEmergencyAlert(alertId);
  }, [resolveEmergencyAlert]);

  return {
    emergencyAlerts,
    triggerAlert: triggerEmergencyAlert,
    receiveAlert: receiveEmergencyAlert,
    handleAlert: handleEmergencyAlert,
    resolveAlert: handleResolveAlert,
    refreshAlerts,
    isConnected
  };
};

/**
 * Hook to monitor real-time connection status
 */
export const useRealtimeStatus = () => {
  const { isConnected, isLoading, error } = useGlobal();

  const getConnectionStatus = () => {
    if (isLoading) return 'connecting';
    if (!isConnected) return 'disconnected';
    return 'connected';
  };

  const getConnectionMessage = () => {
    switch (getConnectionStatus()) {
      case 'connecting':
        return 'Connecting to real-time updates...';
      case 'disconnected':
        return 'Real-time updates disconnected';
      case 'connected':
        return 'Real-time updates active';
      default:
        return 'Unknown connection status';
    }
  };

  return {
    isConnected,
    isLoading,
    error,
    status: getConnectionStatus(),
    message: getConnectionMessage(),
  };
}; 