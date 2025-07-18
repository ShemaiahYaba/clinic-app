import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Switch, Animated, RefreshControl, BackHandler, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useSegments } from 'expo-router';
import { AppLogo } from '@/components/Logo';
import { Greeting } from '@/components/Home/Greeting';
import appJson from '../../app.json';
import { useGlobal } from '@/components/GlobalContext';
import LatestEmergencyCard from '@/components/Home/LatestEmergencyCard';
import RealtimeStatusIndicator from '@/components/Home/RealtimeStatusIndicator';
import { useRefresh } from '@/components/RefreshContext';

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [logoModalVisible, setLogoModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [latestEmergency, setLatestEmergency] = useState<any | null>(null);

  // Animation for modal pop effect
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoOpacityAnim = useRef(new Animated.Value(0)).current;

  // Access global context for latest emergency
  const { emergencyAlerts, isLoading, error } = useGlobal();
  const { refreshing, refreshAll, registerFetcher, unregisterFetcher } = useRefresh();

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onBackPress = () => {
      // Only exit app if on the home tab
      if (segments.join('/') === '(tabs)/home') {
        BackHandler.exitApp();
        return true;
      }
      return false; // Let navigation handle it elsewhere
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [segments]);

  // Remove loadLatestEmergency and its useEffect

  const handleEmergencyDetails = () => {
    router.push('/emergency-details');
  };

  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [modalVisible]);

  useEffect(() => {
    if (logoModalVisible) {
      Animated.parallel([
        Animated.timing(logoScaleAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(logoScaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [logoModalVisible]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshAll}
          colors={['#2563eb']}
          tintColor="#2563eb"
        />
      }
    >
      {/* Show latest emergency if available */}
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => setLogoModalVisible(true)}>
            <AppLogo size={40} />
          </TouchableOpacity>
        </View>
        <Greeting />
        {emergencyAlerts && emergencyAlerts.length > 0 && (
          <LatestEmergencyCard 
            emergencyAlert={emergencyAlerts.find(a => !a.pending) || emergencyAlerts[0]}
            loading={isLoading} 
            error={error}
          />
        )}
        {error && (
          <View style={{ backgroundColor: '#fee2e2', padding: 10, borderRadius: 8, margin: 10 }}>
            <Text style={{ color: '#dc2626', fontWeight: 'bold' }}>Error: {error}</Text>
          </View>
        )}
        <RealtimeStatusIndicator />
      </View>

      <View style={styles.content}>
        <TouchableOpacity onPress={() => router.push('/emergency-report')} activeOpacity={0.85}>
        <View style={styles.emergencyButtonContainer}>
         <TouchableOpacity
           style={styles.outerRing}
           onPress={() => router.push('/emergency-report')}
           activeOpacity={0.85}
         >
           <LinearGradient
             colors={["#ff4e50", "#d90429"]}
             start={{ x: 0.1, y: 0.1 }}
             end={{ x: 0.9, y: 0.9 }}
             style={styles.innerButton}
           >
             <Text style={styles.emergencyButtonText}>REPORT EMERGENCY</Text>
           </LinearGradient>
         </TouchableOpacity>
        </View>
        </TouchableOpacity>

      </View>
      {/* Remove Notification Settings Modal and Vibrate Switch */}

      <Modal
        visible={logoModalVisible}
        animationType="none"
        transparent
        onRequestClose={() => setLogoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: logoScaleAnim }],
                opacity: logoOpacityAnim,
              },
            ]}
          >
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <AppLogo size={60} />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#1e293b', marginBottom: 8, textAlign: 'center' }}>MTU-RapidCare</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#2563eb', textAlign: 'center' }}>Version: {appJson.expo.version}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setLogoModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#f8fafc',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  emergencyButtonContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  outerRing: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#e0e0e0', // metallic/gray outer ring
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
    borderWidth: 3,
    borderColor: '#bdbdbd',
  },
  innerButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffb3b3', // subtle red border
  },
  emergencyButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: '#1976d2',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1e293b',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 12,
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
}); 