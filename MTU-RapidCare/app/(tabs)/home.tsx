import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Switch, Animated, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppLogo } from '@/components/Logo';
import { Greeting } from '@/components/Home/Greeting';
import { EmergencyHistoryCard } from '@/components/Home/EmergencyHistoryCard';
import appJson from '../../app.json';
import { useGlobal } from '@/components/GlobalContext';
import LatestEmergencyCard from '@/components/Home/LatestEmergencyCard';
import RealtimeStatusIndicator from '@/components/Home/RealtimeStatusIndicator';
import { useRefresh } from '@/components/RefreshContext';
import { fetchLatestEmergency } from '@/utils/globalFetchers';

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
  const { emergencyAlert } = useGlobal();
  const { refreshing, refreshAll, registerFetcher, unregisterFetcher } = useRefresh();

  const loadLatestEmergency = useCallback(() => fetchLatestEmergency(setLatestEmergency), []);

  useEffect(() => {
    loadLatestEmergency();
    registerFetcher(loadLatestEmergency);
    return () => unregisterFetcher(loadLatestEmergency);
  }, []);

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
          <TouchableOpacity style={styles.notificationButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="notifications-outline" size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>
        <Greeting />
        {emergencyAlert && emergencyAlert.details && (
          <LatestEmergencyCard emergencyAlert={emergencyAlert} />
        )}
        <RealtimeStatusIndicator />
      </View>

      <View style={styles.content}>
        <TouchableOpacity onPress={() => router.push('/emergency-report')} activeOpacity={0.85}>
        <View style={styles.emergencyButtonContainer}>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => router.push('/emergency-report')} activeOpacity={0.85}
          >
            <Ionicons name="alert" size={72} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.emergencyButtonText}>REPORT EMERGENCY</Text>
        </View>
        </TouchableOpacity>

      </View>
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            <Text style={styles.modalTitle}>Notification Settings</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Enable Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Vibrate on Alert</Text>
              <Switch
                value={vibrateEnabled}
                onValueChange={setVibrateEnabled}
              />
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

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
  emergencyButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#d90429',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#fff',
    shadowColor: '#ffd600',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  emergencyButtonText: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#d90429',
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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