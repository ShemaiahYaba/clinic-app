import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useGlobal } from '@/components/GlobalSearch';
import { useRouter } from 'expo-router';


interface EmergencyDetails {
  location: string;
  condition: string;
  timestamp: number;
}

const ConfirmationPage = () => {
  const router = useRouter();
  const { sickness, hostelname } = useGlobal();
  const [emergencyDetails, setEmergencyDetails] = useState<EmergencyDetails | null>(null);

  useEffect(() => {
    // For demo, create emergency details from global state
    setEmergencyDetails({
      location: hostelname,
      condition: sickness,
      timestamp: Date.now()
    });
  }, [hostelname, sickness]);

  const handleDismiss = () => {
    router.back();
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.alertContainer}>
          <Text style={styles.alertTitle}>EMERGENCY ALERT</Text>
          
          {emergencyDetails ? (
            <View style={styles.alertDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue}>{emergencyDetails.location}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Condition:</Text>
                <Text style={styles.detailValue}>{emergencyDetails.condition}</Text>
              </View>
              
              <Text style={styles.timestampText}>
                Received: {formatTimestamp(emergencyDetails.timestamp)}
              </Text>
            </View>
          ) : (
            <Text style={styles.noDetailsText}>No emergency details available</Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.dismissButton}
          onPress={handleDismiss}
        >
          <Text style={styles.dismissButtonText}>Dismiss Alert</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
export default ConfirmationPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1142BE',
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  alertContainer: {
    alignItems: 'center',
    width: '100%',
  },
  buttonImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  alertTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  alertDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 30,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  detailLabel: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    width: 100,
  },
  detailValue: {
    color: '#ffffff',
    fontSize: 18,
    flex: 1,
  },
  timestampText: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 10,
  },
  noDetailsText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  dismissButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  dismissButtonText: {
    color: '#1142BE',
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

