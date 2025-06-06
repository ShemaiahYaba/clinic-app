import React, { createContext, useState, useContext, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for our emergency alert system
interface EmergencyAlert {
  isActive: boolean;
  timestamp: number | null;
  source?: string;
  details?: string;
  isSender: boolean;
  receivedFrom?: string;
}

interface GlobalState {
  hostelname: string;
  sickness: string;
  emergencyAlert: EmergencyAlert;
  userId: string | null;
  userToken: string | null;
  isLoading: boolean;
  error: string | null;
}

interface GlobalContextType extends GlobalState {
  setHostelname: (name: string) => Promise<void>;
  setSickness: (condition: string) => Promise<void>;
  setEmergencyAlert: (alert: boolean, details?: string, receivedFrom?: string) => void;
  clearEmergencyAlert: () => void;
  initializeState: () => Promise<void>;
  setUserAuth: (id: string, token: string) => Promise<void>;
  clearUserAuth: () => Promise<void>;
  resetError: () => void;
}

const DEFAULT_STATE: GlobalState = {
  hostelname: '',
  sickness: '',
  emergencyAlert: {
    isActive: false,
    timestamp: null,
    details: '',
    isSender: false,
    receivedFrom: undefined
  },
  userId: null,
  userToken: null,
  isLoading: true,
  error: null
};

// Storage keys as constants for consistency
const STORAGE_KEYS = {
  HOSTEL_NAME: '@hexa_hostelname',
  SICKNESS: '@hexa_sickness',
  EMERGENCY: '@hexa_emergency',
  USER_ID: '@userId',
  USER_TOKEN: '@userToken',
} as const;

// Create context with undefined default value
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

/**
 * Global state provider component for the application
 */
export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GlobalState>(DEFAULT_STATE);

  /**
   * Initialize application state from AsyncStorage
   */
  const initializeState = useCallback(async () => {
    try {
      setState(prevState => ({ ...prevState, isLoading: true, error: null }));
      
      const [hostelname, sickness, emergencyData, userId, userToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.HOSTEL_NAME),
        AsyncStorage.getItem(STORAGE_KEYS.SICKNESS),
        AsyncStorage.getItem(STORAGE_KEYS.EMERGENCY),
        AsyncStorage.getItem(STORAGE_KEYS.USER_ID),
        AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN),
      ]);

      setState(prevState => ({
        ...prevState,
        hostelname: hostelname || '',
        sickness: sickness || '',
        emergencyAlert: emergencyData 
          ? JSON.parse(emergencyData)
          : DEFAULT_STATE.emergencyAlert,
        userId: userId || null,
        userToken: userToken || null,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error initializing global state:', error);
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: 'Failed to load application state'
      }));
    }
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
   * Set emergency alert state and persist to storage
   */
  const setEmergencyAlert = useCallback((isActive: boolean, details?: string, receivedFrom?: string) => {
    const newAlert: EmergencyAlert = {
      isActive,
      timestamp: isActive ? Date.now() : null,
      details: details || '',
      isSender: !receivedFrom, // If receivedFrom is provided, this is not the sender
      receivedFrom
    };

    setState(prevState => ({
      ...prevState,
      emergencyAlert: newAlert,
    }));

    AsyncStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(newAlert))
      .catch(error => {
        console.error('Error saving emergency state:', error);
        setState(prevState => ({ 
          ...prevState, 
          error: 'Failed to save emergency alert state' 
        }));
      });
  }, []);

  /**
   * Clear emergency alert state and remove from storage
   */
  const clearEmergencyAlert = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      emergencyAlert: DEFAULT_STATE.emergencyAlert,
    }));

    AsyncStorage.removeItem(STORAGE_KEYS.EMERGENCY)
      .catch(error => {
        console.error('Error clearing emergency state:', error);
        setState(prevState => ({ 
          ...prevState, 
          error: 'Failed to clear emergency alert' 
        }));
      });
  }, []);

  /**
   * Set user authentication details and persist to storage
   */
  const setUserAuth = useCallback(async (id: string, token: string) => {
    try {
      setState(prevState => ({ ...prevState, isLoading: true, error: null }));
      
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER_ID, id),
        AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token)
      ]);
      
      setState(prevState => ({ 
        ...prevState, 
        userId: id,
        userToken: token,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error saving user authentication:', error);
      setState(prevState => ({ 
        ...prevState, 
        isLoading: false,
        error: 'Failed to save authentication data' 
      }));
      throw error;
    }
  }, []);

  /**
   * Clear user authentication and remove from storage
   */
  const clearUserAuth = useCallback(async () => {
    try {
      setState(prevState => ({ ...prevState, isLoading: true, error: null }));
      
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER_ID),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN)
      ]);
      
      setState(prevState => ({ 
        ...prevState, 
        userId: null,
        userToken: null,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error clearing user authentication:', error);
      setState(prevState => ({ 
        ...prevState, 
        isLoading: false,
        error: 'Failed to clear authentication data' 
      }));
      throw error;
    }
  }, []);

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setState(prevState => ({ ...prevState, error: null }));
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...state,
    setHostelname,
    setSickness,
    setEmergencyAlert,
    clearEmergencyAlert,
    initializeState,
    setUserAuth,
    clearUserAuth,
    resetError
  }), [
    state, 
    setHostelname, 
    setSickness, 
    setEmergencyAlert, 
    clearEmergencyAlert, 
    initializeState, 
    setUserAuth, 
    clearUserAuth,
    resetError
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
  } = useGlobal();

  const triggerEmergencyAlert = useCallback((details?: string) => {
    setEmergencyAlert(true, details);
  }, [setEmergencyAlert]);

  const receiveEmergencyAlert = useCallback((details?: string, senderId?: string) => {
    setEmergencyAlert(true, details, senderId);
  }, [setEmergencyAlert]);

  const handleEmergencyAlert = useCallback(() => {
    clearEmergencyAlert();
  }, [clearEmergencyAlert]);

  return {
    isActive: emergencyAlert.isActive,
    timestamp: emergencyAlert.timestamp,
    details: emergencyAlert.details,
    isSender: emergencyAlert.isSender,
    receivedFrom: emergencyAlert.receivedFrom,
    triggerAlert: triggerEmergencyAlert,
    receiveAlert: receiveEmergencyAlert,
    handleAlert: handleEmergencyAlert,
  };
};