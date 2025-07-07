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

interface GlobalState {
  hostelname: string;
  sickness: string;
  emergencyAlert: EmergencyAlert;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

interface GlobalContextType extends GlobalState {
  setHostelname: (name: string) => Promise<void>;
  setSickness: (condition: string) => Promise<void>;
  setEmergencyAlert: (alert: boolean, details?: string, receivedFrom?: string) => Promise<void>;
  clearEmergencyAlert: () => Promise<void>;
  resolveEmergencyAlert: (alertId: string) => Promise<void>;
  initializeState: () => Promise<void>;
  resetError: () => void;
  getEmergencyState: () => Promise<EmergencyAlertData | null>;
  refreshAlerts: () => Promise<void>;
}

const DEFAULT_STATE: GlobalState = {
  hostelname: '',
  sickness: '',
  emergencyAlert: {
    isActive: false,
    timestamp: null,
    details: '',
    isSender: false
  },
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

  /**
   * Initialize application state from AsyncStorage and database
   */
  const initializeState = useCallback(async () => {
    try {
      setState(prevState => ({ ...prevState, isLoading: true, error: null }));
      
      const [hostelname, sickness] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.HOSTEL_NAME),
        AsyncStorage.getItem(STORAGE_KEYS.SICKNESS),
      ]);

      // Load active alerts from database
      const alertsResult = await getActiveAlerts();
      const latestAlert = alertsResult.success && alertsResult.data && alertsResult.data.length > 0 
        ? alertsResult.data[0] 
        : null;

      setState(prevState => ({
        ...prevState,
        hostelname: hostelname || '',
        sickness: sickness || '',
        emergencyAlert: latestAlert ? {
          id: latestAlert.id,
          isActive: true,
          timestamp: new Date(latestAlert.created_at).getTime(),
          details: latestAlert.message,
          isSender: false, // Will be determined by device ID comparison
          status: latestAlert.status,
          location: latestAlert.location,
          resolved_at: latestAlert.resolved_at
        } : DEFAULT_STATE.emergencyAlert,
        isLoading: false,
        isConnected: true
      }));
    } catch (error) {
      console.error('Error initializing global state:', error);
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: 'Failed to load application state',
        isConnected: false
      }));
    }
  }, []);

  /**
   * Set up real-time subscription to alerts
   */
  useEffect(() => {
    let subscription: any;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const setupRealtimeSubscription = async () => {
      try {
        // Clean up existing subscription
        if (subscription) {
          subscription.unsubscribe();
        }

        subscription = supabase
          .channel('alerts')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'alerts',
            },
            async (payload) => {
              console.log('Real-time event received:', payload.eventType, payload.new);
              // Handle all database changes
              if (payload.eventType === 'INSERT') {
                const newAlert = payload.new;
                setState(prevState => ({
                  ...prevState,
                  emergencyAlert: {
                    id: newAlert.id,
                    isActive: true,
                    timestamp: new Date(newAlert.created_at).getTime(),
                    details: newAlert.message,
                    isSender: false, // Will be determined by device ID comparison
                    status: newAlert.status,
                    location: newAlert.location,
                    resolved_at: newAlert.resolved_at
                  }
                }));
              } else if (payload.eventType === 'UPDATE') {
                const updatedAlert = payload.new;
                console.log('UPDATE event received for alert:', updatedAlert.id, 'status:', updatedAlert.status);
                if (updatedAlert.status === 'resolved') {
                  console.log('Updating alert to resolved status');
                  // Update the current alert to show resolved status
                  setState(prevState => ({
                    ...prevState,
                    emergencyAlert: {
                      ...prevState.emergencyAlert,
                      status: 'resolved',
                      isActive: false,
                      resolved_at: updatedAlert.resolved_at
                    }
                  }));
                } else if (updatedAlert.status === 'active') {
                  // Update alert details if it becomes active again
                  setState(prevState => ({
                    ...prevState,
                    emergencyAlert: {
                      id: updatedAlert.id,
                      isActive: true,
                      timestamp: new Date(updatedAlert.created_at).getTime(),
                      details: updatedAlert.message,
                      isSender: false,
                      status: updatedAlert.status,
                      location: updatedAlert.location,
                      resolved_at: updatedAlert.resolved_at
                    }
                  }));
                }
              } else if (payload.eventType === 'DELETE') {
                // Clear alert if it's deleted
                setState(prevState => ({
                  ...prevState,
                  emergencyAlert: DEFAULT_STATE.emergencyAlert
                }));
              }
            }
          )
          .on('presence', { event: 'sync' }, () => {
            // Handle presence sync
          })
          .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            // Handle new connections
          })
          .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            // Handle disconnections
          })
          .subscribe((status) => {
            console.log('Real-time subscription status:', status);
            if (status === 'SUBSCRIBED') {
              console.log('Real-time subscription connected');
              setState(prevState => ({ ...prevState, isConnected: true }));
            } else if (status === 'CHANNEL_ERROR') {
              console.log('Real-time subscription error');
              setState(prevState => ({ ...prevState, isConnected: false }));
              // Attempt to reconnect after 5 seconds
              reconnectTimer = setTimeout(() => {
                setupRealtimeSubscription();
              }, 5000);
            } else if (status === 'TIMED_OUT') {
              console.log('Real-time subscription timed out');
              setState(prevState => ({ ...prevState, isConnected: false }));
              // Attempt to reconnect after 3 seconds
              reconnectTimer = setTimeout(() => {
                setupRealtimeSubscription();
              }, 3000);
            }
          });

      } catch (error) {
        setState(prevState => ({ ...prevState, isConnected: false }));
        // Attempt to reconnect after 10 seconds
        reconnectTimer = setTimeout(() => {
          setupRealtimeSubscription();
        }, 10000);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, []);

  // Initial load of state from storage
  useEffect(() => {
    initializeState();
  }, [initializeState]);

  /**
   * Set hostel name and persist to storage
   */
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
      console.error('Error saving hostel name:', error);
      setState(prevState => ({ 
        ...prevState, 
        isLoading: false,
        error: 'Failed to save hostel selection' 
      }));
      throw error;
    }
  }, []);

  /**
   * Set sickness condition and persist to storage
   */
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
      console.error('Error saving sickness condition:', error);
      setState(prevState => ({ 
        ...prevState, 
        isLoading: false,
        error: 'Failed to save medical condition' 
      }));
      throw error;
    }
  }, []);

  /**
   * Set emergency alert state (syncs with database)
   */
  const setEmergencyAlert = useCallback(async (isActive: boolean, details?: string, receivedFrom?: string) => {
    try {
      setState(prevState => ({ ...prevState, isLoading: true, error: null }));

      if (isActive && details) {
        // Only update local state, do NOT call triggerEmergencyAlert here!
        const newAlert: EmergencyAlert = {
          id: undefined, // or pass in the id from the submit handler if needed
          isActive: true,
          timestamp: Date.now(),
          details: details,
          isSender: true, // This user triggered the alert
          status: 'active',
          location: receivedFrom
        };

        setState(prevState => ({
          ...prevState,
          emergencyAlert: newAlert,
          isLoading: false
        }));
      } else {
        // Clear alert
        setState(prevState => ({
          ...prevState,
          emergencyAlert: DEFAULT_STATE.emergencyAlert,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error setting emergency alert:', error);
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to set emergency alert'
      }));
      throw error;
    }
  }, []);

  /**
   * Clear emergency alert state
   */
  const clearEmergencyAlert = useCallback(async () => {
    setState(prevState => ({
      ...prevState,
      emergencyAlert: DEFAULT_STATE.emergencyAlert,
    }));
  }, []);

  /**
   * Resolve emergency alert (updates database)
   */
  const resolveEmergencyAlert = useCallback(async (alertId: string) => {
    try {
      setState(prevState => ({ ...prevState, isLoading: true, error: null }));
      
      const result = await resolveAlert(alertId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to resolve alert');
      }

      // Local state will be updated by real-time subscription
      setState(prevState => ({ ...prevState, isLoading: false }));
    } catch (error) {
      console.error('Error resolving emergency alert:', error);
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to resolve alert'
      }));
      throw error;
    }
  }, []);

  /**
   * Refresh alerts from database
   */
  const refreshAlerts = useCallback(async () => {
    try {
      const alertsResult = await getActiveAlerts();
      const latestAlert = alertsResult.success && alertsResult.data && alertsResult.data.length > 0 
        ? alertsResult.data[0] 
        : null;

      setState(prevState => ({
        ...prevState,
        emergencyAlert: latestAlert ? {
          id: latestAlert.id,
          isActive: true,
          timestamp: new Date(latestAlert.created_at).getTime(),
          details: latestAlert.message,
          isSender: false,
          status: latestAlert.status,
          location: latestAlert.location,
          resolved_at: latestAlert.resolved_at
        } : DEFAULT_STATE.emergencyAlert
      }));
    } catch (error) {
      console.error('Error refreshing alerts:', error);
    }
  }, []);

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setState(prevState => ({ ...prevState, error: null }));
  }, []);

  const getEmergencyState = useCallback(async (): Promise<EmergencyAlertData | null> => {
    try {
      const emergencyData = await AsyncStorage.getItem(STORAGE_KEYS.EMERGENCY);
      return emergencyData ? JSON.parse(emergencyData) : null;
    } catch (error) {
      console.error('Error getting emergency state:', error);
      return null;
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...state,
    setHostelname,
    setSickness,
    setEmergencyAlert,
    clearEmergencyAlert,
    resolveEmergencyAlert,
    initializeState,
    resetError,
    getEmergencyState,
    refreshAlerts
  }), [
    state, 
    setHostelname, 
    setSickness, 
    setEmergencyAlert, 
    clearEmergencyAlert,
    resolveEmergencyAlert,
    initializeState, 
    resetError,
    getEmergencyState,
    refreshAlerts
  ]);

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
    emergencyAlert, 
    setEmergencyAlert, 
    clearEmergencyAlert,
    resolveEmergencyAlert,
    refreshAlerts,
    isConnected
  } = useGlobal();

  const triggerEmergencyAlert = useCallback(async (details?: string, location?: string) => {
    await setEmergencyAlert(true, details, location);
  }, [setEmergencyAlert]);

  const receiveEmergencyAlert = useCallback(async (details?: string, senderId?: string) => {
    await setEmergencyAlert(true, details, senderId);
  }, [setEmergencyAlert]);

  const handleEmergencyAlert = useCallback(async () => {
    await clearEmergencyAlert();
  }, [clearEmergencyAlert]);

  const handleResolveAlert = useCallback(async (alertId: string) => {
    await resolveEmergencyAlert(alertId);
  }, [resolveEmergencyAlert]);

  return {
    isActive: emergencyAlert.isActive,
    timestamp: emergencyAlert.timestamp,
    details: emergencyAlert.details,
    isSender: emergencyAlert.isSender,
    receivedFrom: emergencyAlert.receivedFrom,
    status: emergencyAlert.status,
    location: emergencyAlert.location,
    alertId: emergencyAlert.id,
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