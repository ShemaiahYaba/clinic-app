import Constants from 'expo-constants';

export const CONFIG = {
  PROJECT_ID: Constants.expoConfig?.extra?.eas?.projectId,
  API_URL: Constants.expoConfig?.extra?.apiUrl,
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  EDGE_FUNCTION_URL: process.env.EXPO_PUBLIC_EDGE_FUNCTION_URL || '',
  NOTIFICATION: {
    ICON: './assets/notification-icon.png',
    COLOR: '#ffffff',
    ANDROID_MODE: 'default',
    ANDROID_COLLAPSED_TITLE: 'HEXA'
  }
} as const;

export const STORAGE_KEYS = {
  USER_ID: 'userId',
  USER_TOKEN: 'userToken',
  HOSTEL_NAME: 'hostelName',
  SICKNESS: 'sickness',
  EMERGENCY: 'emergency',
  DEVICE_TOKEN: 'deviceToken'
} as const;

export const ERROR_MESSAGES = {
  UNEXPECTED_ERROR: 'An unexpected error occurred',
  NO_SESSION: 'No active session',
  INVALID_CREDENTIALS: 'Invalid credentials',
  NETWORK_ERROR: 'Network error occurred',
  DATABASE_ERROR: 'Database error occurred',
  AUTH_ERROR: 'Authentication failed. Please try logging in again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  EMERGENCY_ERROR: 'Failed to trigger emergency alert. Please try again.'
} as const; 