import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { CONFIG } from '@/config/constants';

// Import polyfill only for native platforms
if (Platform.OS !== 'web') {
  require('react-native-url-polyfill/auto');
}

// Import AsyncStorage only for native platforms
let AsyncStorage: any = null;
if (Platform.OS !== 'web') {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

// Create platform-specific configuration
const createSupabaseConfig = () => {
  const baseConfig = {
    autoRefreshToken: true,
    persistSession: true,
  };

  if (Platform.OS === 'web') {
    return {
      ...baseConfig,
      detectSessionInUrl: true, // required for OAuth redirects in web
    };
  } else {
    return {
      ...baseConfig,
      storage: AsyncStorage,
      detectSessionInUrl: false,
    };
  }
};

export const supabase = createClient(
  CONFIG.SUPABASE_URL,
  CONFIG.SUPABASE_ANON_KEY,
  {
    auth: createSupabaseConfig(),
    db: {
      schema: 'public'
    }
  }
); 