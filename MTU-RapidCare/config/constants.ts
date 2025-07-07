import Constants from 'expo-constants';

// Development fallback values for Expo Go testing
const getDevelopmentFallbacks = () => {
  if (__DEV__) {
    return {
      SUPABASE_URL: 'https://oxhjrszqngdyvbixxyvo.supabase.co',
      SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94aGpyc3pxbmdkeXZiaXh4eXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTQxMDEsImV4cCI6MjA2NTMzMDEwMX0.UBD012OOhDogrPrYtQZibdg-pZ64ZNLhSDNw3zndEoA',
      SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94aGpyc3pxbmdkeXZiaXh4eXZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTc1NDEwMSwiZXhwIjoyMDY1MzMwMTAxfQ.VWaHFGSVdUtOGq5_JN09rdBWkB2yBVn-iJySuWG9D-Y',
      EDGE_FUNCTION_URL: 'https://oxhjrszqngdyvbixxyvo.supabase.co/functions/v1/send-push-alert'
    };
  }
  return {};
};

const devFallbacks = getDevelopmentFallbacks();

export const CONFIG = {
  PROJECT_ID: Constants.expoConfig?.extra?.eas?.projectId,
  API_URL: Constants.expoConfig?.extra?.apiUrl,
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || devFallbacks.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || devFallbacks.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || devFallbacks.SUPABASE_SERVICE_ROLE_KEY || '',
  EDGE_FUNCTION_URL: process.env.EXPO_PUBLIC_EDGE_FUNCTION_URL || devFallbacks.EDGE_FUNCTION_URL || '',
  NOTIFICATION: {
    ICON: './assets/notification-icon.png',
    COLOR: '#ffffff',
    ANDROID_MODE: 'default',
    ANDROID_COLLAPSED_TITLE: 'HEXA'
  }
} as const;

export const STORAGE_KEYS = {
  HOSTEL_NAME: 'hostelName',
  SICKNESS: 'sickness',
  EMERGENCY: 'emergency',
} as const;

export const ERROR_MESSAGES = {
  UNEXPECTED_ERROR: 'An unexpected error occurred',
  NETWORK_ERROR: 'Network error occurred',
  DATABASE_ERROR: 'Database error occurred',
  VALIDATION_ERROR: 'Please check your input and try again.',
  EMERGENCY_ERROR: 'Failed to trigger emergency alert. Please try again.'
} as const; 