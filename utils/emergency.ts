import { supabase } from '@/utils/supabaseClient';
import { Alert } from 'react-native';

export const triggerEmergency = async () => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Insert alert into the alerts table
    const { error } = await supabase
      .from('alerts')
      .insert([
        {
          sender_id: user.id,
          message: 'Emergency alert triggered!'
        }
      ]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error triggering emergency:', error);
    Alert.alert(
      'Error',
      'Failed to trigger emergency alert. Please try again.'
    );
    return false;
  }
}; 