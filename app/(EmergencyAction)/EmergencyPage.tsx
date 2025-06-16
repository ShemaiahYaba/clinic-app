import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Vibration,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGlobal } from '@/components/GlobalSearch';
import { triggerEmergency } from '@/utils/emergency';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';

const EmergencyPage = () => {
  const router = useRouter();
  const { sickness, hostelname } = useGlobal();
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useRealtimeAlerts();

  const handleEmergency = async () => {
    try {
      setIsLoading(true);
      Vibration.vibrate([0, 500, 200, 500]);

      const success = await triggerEmergency();
      
      if (success) {
        router.push('/(EmergencyAction)/ConfirmationPage');
      }
    } catch (error) {
      console.error('Error handling emergency:', error);
      Alert.alert(
        'Error',
        'Failed to send emergency signal. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const confirmEmergency = () => {
    if (!hostelname || !sickness) {
      Alert.alert('Error', 'Please provide both location and condition.');
      return;
    }

    Alert.alert(
      'Confirm Emergency',
      'Are you sure you want to send an emergency signal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Emergency Signal', onPress: handleEmergency, style: 'destructive' },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      {!isConnected && (
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, styles.disconnectedIndicator]} />
          <Text style={styles.statusText}>Not connected to alert system</Text>
        </View>
      )}
      
      <TouchableOpacity 
        onPress={confirmEmergency}
        style={[
          styles.emergencyButton, 
          (isLoading || !isConnected) && styles.emergencyButtonDisabled
        ]}
        disabled={isLoading || !isConnected}
      >
        <Text style={styles.emergencyButtonText}>
          {isLoading ? 'Sending Emergency Signal...' : 'Trigger Emergency Alert'}
        </Text>
      </TouchableOpacity>

      {hostelname && sickness && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Location: {hostelname}</Text>
          <Text style={styles.infoText}>Condition: {sickness}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1142BE',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    position: 'absolute',
    top: 50,
    zIndex: 100,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  disconnectedIndicator: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
  },
  emergencyButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  emergencyButtonDisabled: {
    opacity: 0.7,
  },
  emergencyButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  infoText: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 5,
  },
});

export default EmergencyPage;