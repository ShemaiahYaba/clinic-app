import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useEmergencyAlert } from '@/hooks/useEmergencyAlert';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';
import { EmergencyButton } from '@/components/EmergencyButton';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export default function EmergencyTab() {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useRealtimeAlerts();
  const { triggerEmergency } = useEmergencyAlert();

  const handleEmergency = async () => {
    try {
      setIsLoading(true);
      const response = await triggerEmergency('Emergency alert triggered');
      
      if (!response.success) {
        Alert.alert('Error', response.error || 'Failed to trigger emergency alert');
        return;
      }

      Alert.alert('Success', 'Emergency alert has been sent');
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ConnectionStatus isConnected={isConnected} />
      <EmergencyButton onPress={handleEmergency} />
      <LoadingOverlay visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
}); 