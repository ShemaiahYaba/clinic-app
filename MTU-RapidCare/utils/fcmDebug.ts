import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

export const debugFCMConfiguration = async () => {
  console.log('🔍 FCM Configuration Debug Report');
  console.log('=====================================');
  
  // Check device info
  console.log('📱 Device Info:');
  console.log('- Platform:', Platform.OS);
  console.log('- Platform Version:', Platform.Version);
  
  // Check if Notifications module is available
  console.log('\n📦 Notifications Module Test:');
  try {
    console.log('- Notifications module loaded:', !!Notifications);
    console.log('- getPermissionsAsync available:', !!Notifications.getPermissionsAsync);
    console.log('- getExpoPushTokenAsync available:', !!Notifications.getExpoPushTokenAsync);
  } catch (error) {
    console.log('- ❌ Notifications module error:', error);
  }
  
  // Check notification permissions
  console.log('\n📋 Notification Permissions:');
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('- Current Status:', existingStatus);
  } catch (error) {
    console.log('- ❌ Permission check error:', error);
  }
  
  // Check if we can get a token
  console.log('\n🎯 Push Token Test:');
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    console.log('- Token Received:', !!tokenData.data);
    console.log('- Token Length:', tokenData.data?.length || 0);
    console.log('- Token Preview:', tokenData.data?.substring(0, 30) + '...');
    console.log('- Token Type:', typeof tokenData.data);
  } catch (error: any) {
    console.log('- ❌ Token Error:', error);
    console.log('- ❌ Error Message:', error?.message);
    console.log('- ❌ Error Code:', error?.code);
    
    // Show error in alert for debugging
    Alert.alert(
      'FCM Debug Error',
      `Token Error:\n${error?.message}\n\nCode: ${error?.code}`,
      [{ text: 'OK' }]
    );
  }
  
  console.log('\n=====================================');
  console.log('🔍 Debug Report Complete');
};

// Test notification function removed due to type issues
// Focus on the main debug function instead 