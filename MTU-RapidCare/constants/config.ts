export const EXPO_PROJECT_ID = 'c90572c1-39a6-414b-9547-eac1231e32e6';

export const STORAGE_KEYS = {
  HOSTEL_NAME: '@hexa_hostelname',
  SICKNESS: '@hexa_sickness',
  EMERGENCY: '@hexa_emergency',
  USER_ID: '@userId',
  USER_TOKEN: '@userToken',
} as const;

export const NOTIFICATION_CHANNEL = {
  id: 'default',
  name: 'default',
  importance: 'max',
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#FF231F7C',
} as const; 