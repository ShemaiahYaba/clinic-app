import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Alert, RefreshControl, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRealtimeStatus } from '@/components/GlobalContext';
import { registerDevice } from '@/services/deviceService';
import * as Notifications from 'expo-notifications';
import { useToast } from '@/hooks/useToast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRefresh } from '@/components/RefreshContext';
import { fetchDeviceInfo } from '@/utils/globalFetchers';
import { debugFCMConfiguration } from '@/utils/fcmDebug';
import Constants from 'expo-constants';

export default function ProfileScreen() {
  const { status } = useRealtimeStatus();
  const { show } = useToast();
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const { refreshing, refreshAll, registerFetcher, unregisterFetcher } = useRefresh();
  const [buildInfoVisible, setBuildInfoVisible] = useState(false);
  const [buildInfo, setBuildInfo] = useState<string>('');

  const loadDeviceInfo = useCallback(() => fetchDeviceInfo(setDeviceName, setDeviceId), []);

  useEffect(() => {
    loadDeviceInfo();
    registerFetcher(loadDeviceInfo);
    return () => unregisterFetcher(loadDeviceInfo);
  }, []);

  // Add getStatusColor function here, inside the component
  const getStatusColor = () => {
    switch (status) {
      case 'connecting':
        return '#f59e42'; // Orange
      case 'disconnected':
        return '#ef4444'; // Red
      case 'connected':
        return '#22c55e'; // Green
      default:
        return '#6b7280'; // Gray
    }
  };

  const handleRegisterDevice = async () => {
    console.log('🚀 Starting device registration process...');
    
    // Get Expo push token
    let expoToken = '';
    try {
      console.log('📱 Checking notification permissions...');
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('📋 Current permission status:', existingStatus);
      
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        console.log('🔐 Requesting notification permissions...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log('📋 New permission status:', finalStatus);
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Permission denied by user');
        Alert.alert('Permission required', 'Push notification permission is required to register your device.');
        return;
      }
      
      console.log('✅ Permission granted, getting push token...');
      try {
        // Get project ID from Constants
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        console.log('🏗️ Project ID:', projectId);
        
        if (!projectId) {
          throw new Error('Project ID not found in Constants');
        }
        
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        expoToken = tokenData.data;
        console.log('🎯 Expo Push Token received:', expoToken);
        console.log('📏 Token length:', expoToken.length);
        console.log('🔍 Token starts with:', expoToken.substring(0, 20) + '...');
      } catch (tokenError: any) {
        console.log('❌ Detailed token error:', tokenError);
        console.log('❌ Error message:', tokenError?.message);
        console.log('❌ Error code:', tokenError?.code);
        console.log('❌ Error stack:', tokenError?.stack);
        
        // Show error in alert for debugging
        Alert.alert(
          'Token Error Details',
          `Message: ${tokenError?.message}\nCode: ${tokenError?.code}`,
          [{ text: 'OK' }]
        );
        
        throw tokenError; // Re-throw to be caught by outer catch
      }
      
    } catch (e) {
      console.log('❌ Error getting push token:', e);
      console.log('🔍 Error details:', JSON.stringify(e, null, 2));
      Alert.alert('Error', 'Failed to get push notification token.');
      return;
    }
    
    const platform = Platform.OS;
    console.log('📱 Platform:', platform);
    console.log('🌐 Registering device with backend...');
    
    const result = await registerDevice(expoToken, platform);
    console.log('📊 Registration result:', result);
    
    if (result.success && result.data?.id) {
      console.log('✅ Device registered successfully with ID:', result.data.id);
      await AsyncStorage.setItem('device_id', result.data.id);
      show({ type: 'success', text1: 'Device registered successfully!' });
    } else {
      console.log('❌ Device registration failed:', result.error);
      show({ type: 'error', text1: result.error || 'Failed to register device.' });
    }
  };

  const handleShowBuildInfo = () => {
    // Get build info as a string (modify checkBuildInfo to return string if needed)
    const info = getBuildInfoString();
    setBuildInfo(info);
    setBuildInfoVisible(true);
  };

  const getBuildInfoString = () => {
    // You may need to update checkBuildInfo to return a string instead of logging
    // For now, we can use Constants directly
    return `App Version: ${Constants.expoConfig?.version || ''}\nBuild Type: ${Constants.appOwnership || ''}\nInstallation ID: ${Constants.installationId || ''}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Device Information</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={handleShowBuildInfo}>
          <Ionicons name="information-circle-outline" size={20} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshAll}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="phone-portrait" size={40} color="#94a3b8" />
              <View style={[
                styles.onlineIndicator,
                { backgroundColor: getStatusColor() }
              ]} />
            </View>
          </View>
          <Text style={styles.name}>{deviceName ? deviceName : 'Register Device'}</Text>
          <Text style={styles.deviceId}>{deviceId ? `Device ID: ${deviceId}` : ''}</Text>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={handleRegisterDevice}>
            <Ionicons name="shield-outline" size={24} color="#1e293b" />
            <Text style={styles.menuText}>Register Device</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={debugFCMConfiguration}>
            <Ionicons name="bug-outline" size={24} color="#1e293b" />
            <Text style={styles.menuText}>Debug FCM</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={24} color="#1e293b" />
            <Text style={styles.menuText}>Contact Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        visible={buildInfoVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBuildInfoVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, minWidth: 280 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Build Info</Text>
            <Text style={{ fontSize: 14, color: '#334155', marginBottom: 16, fontFamily: 'Poppins-Regular' }}>{buildInfo}</Text>
            <TouchableOpacity onPress={() => setBuildInfoVisible(false)} style={{ alignSelf: 'flex-end', marginTop: 8 }}>
              <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
  },
  menuSection: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#1e293b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#dc2626',
  },
  onlineIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
}); 