import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobal } from '@/components/GlobalContext';
import EmergencyDetails from '@/components/Home/EmergencyDetails';
import { getActiveAlerts } from '@/utils/database';

interface Alert {
  id: string;
  created_at: string;
  message: string;
  status: string;
  location?: string;
  resolved_at?: string;
  extra_data?: any;
}

export default function EmergencyDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { emergencyAlerts, clearEmergencyAlerts } = useGlobal();
  const [alertData, setAlertData] = useState<Alert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load alert data from database if ID is provided
  useEffect(() => {
    const loadAlertData = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const result = await getActiveAlerts();
        if (result.success && result.data) {
          const foundAlert = result.data.find(alert => alert.id === id);
          if (foundAlert) {
            setAlertData(foundAlert);
          } else {
            setError('Emergency alert not found');
          }
        } else {
          setError('Failed to load emergency data');
        }
      } catch (err) {
        setError('Error loading emergency details');
      } finally {
        setIsLoading(false);
      }
    };

    loadAlertData();
  }, [id]);

  // Listen for real-time updates from global state
  useEffect(() => {
    if (emergencyAlerts && emergencyAlerts.length > 0) {
      const currentAlert = emergencyAlerts.find(a => a.id === id);
      if (currentAlert) {
        console.log('Emergency details: Real-time update received for alert:', id);
        console.log('New status:', currentAlert.status, 'resolved_at:', currentAlert.resolved_at);
        // Update local state when global state changes
        setAlertData({
          id: currentAlert.id,
          created_at: currentAlert.created_at,
          message: currentAlert.message,
          status: currentAlert.status || 'active',
          location: currentAlert.location,
          resolved_at: currentAlert.resolved_at
        });
      }
    }
  }, [emergencyAlerts, id]);

  const handleDismiss = async () => {
    // Don't clear the emergency alert when just viewing details
    // Only clear when explicitly dismissing
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/home');
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/home');
    }
  };

  // Determine which data to use
  const displayData = alertData || emergencyAlerts.find(a => a.id === id);

  // Debug logging
  console.log('Emergency details: Current alertData:', alertData?.status, alertData?.resolved_at);
  console.log('Emergency details: Current emergencyAlerts:', emergencyAlerts.map(a => ({ id: a.id, status: a.status, resolved_at: a.resolved_at })));
  console.log('Emergency details: Using displayData:', displayData?.status, displayData?.resolved_at);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/images/alert.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading emergency details...</Text>
        </View>
      </View>
    );
  }

  if (error || !displayData) {
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/images/alert.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>No Emergency Found</Text>
          <Text style={styles.errorText}>
            {error || 'The emergency alert you\'re looking for is not available.'}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/images/alert.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <View style={styles.emergencyContainer}>
        <EmergencyDetails 
          emergencyAlert={{
            id: displayData.id,
            isActive: displayData.status === 'active',
            details: displayData.message,
            timestamp: new Date(displayData.created_at).getTime(),
            status: displayData.status,
            location: displayData.location,
            resolved_at: displayData.resolved_at
          }}
          onDismiss={handleDismiss}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'flex-start',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  image: {
    width: 200,
    height: 200,
  },
  emergencyContainer: {
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});