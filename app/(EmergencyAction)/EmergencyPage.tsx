import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Vibration,
  AppState,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useGlobal, useEmergencyAlert } from '@/components/GlobalSearch';
import images from '../../constants/Image';
import { io, Socket } from 'socket.io-client';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Import axios
import { registerDeviceToken } from "@/services/deviceService";

// Update API URLs - replace with your actual server address in production
const API_BASE_URL = 'https://api-hexa.onrender.com';
const SOCKET_URL = 'https://api-hexa.onrender.com/';

// Create an axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true
  }),
});

// Define interfaces for type safety
interface EmergencyData {
  senderId: string;
  message: string;
  location?: string;
  condition?: string;
  timestamp?: string;
  pushToken?: string;
}

interface EmergencyAcknowledgement {
  success: boolean;
  message?: string;
  timestamp?: string;
  id?: string;
}

// Function to get push notification token
const registerForPushNotificationsAsync = async () => {
  let token;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert('Permission Denied', 'Enable notifications to receive emergency alerts.');
      return null;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
  } else {
    Alert.alert('Physical Device Required', 'Push notifications require a physical device.');
  }

  return token;
};

const EmergencyPage = () => {
  const router = useRouter();
  const { sickness, hostelname, userId, userToken } = useGlobal();
  const { triggerAlert } = useEmergencyAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  
  // Connection status management
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isNetworkAvailable, setIsNetworkAvailable] = useState(true);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Setup axios interceptor for authentication
  useEffect(() => {
    if (userToken) {
      const interceptor = axiosInstance.interceptors.request.use(
        (config) => {
          config.headers.Authorization = `Bearer ${userToken}`;
          return config;
        },
        (error) => Promise.reject(error)
      );
      
      return () => {
        axiosInstance.interceptors.request.eject(interceptor);
      };
    }
  }, [userToken]);

  // Load user authentication data
  useEffect(() => {
    if (!userId || !userToken) {
      Alert.alert(
        'Authentication Required',
        'Please log in to use the emergency feature.',
        [
          { text: 'OK', onPress: () => router.replace('./') }
        ]
      );
    }
  }, [userId, userToken]);

  // Register for push notifications
  useEffect(() => {
    const registerForPushNotifications = async () => {
      if (userId) {
        const token = await registerDeviceToken(userId);
        if (token) {
          setExpoPushToken(token);
        }
      }
    };

    registerForPushNotifications();
  }, [userId]);

  // Handle network state changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const networkAvailable = state.isConnected && state.isInternetReachable !== false;
      setIsNetworkAvailable(!!networkAvailable);
      
      if (networkAvailable && connectionStatus === 'disconnected') {
        // Network became available, trigger reconnection
        connectSocket();
      }
    });
    
    return () => unsubscribe();
  }, [connectionStatus]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appStateRef.current.match(/inactive|background/) && 
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        console.log('App has come to the foreground!');
        if (connectionStatus !== 'connected') {
          connectSocket();
        } else {
          // Check if the connection is actually alive with a ping
          socketRef.current?.emit('ping', () => {
            console.log('Connection is still alive');
          });
        }
      }
      
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [connectionStatus]);

  // Initialize notification listeners
  useEffect(() => {
    // Set up notification handler for when app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
      setNotification(notification);
    });

    // Set up response handler for when user taps on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
      // Navigate to appropriate screen based on notification data if needed
      router.push('/(EmergencyAction)/EmergencyRing');
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Initialize heartbeat mechanism
  const startHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
    }
    
    heartbeatTimerRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        // Send a ping to keep the connection alive
        socketRef.current.emit('ping', () => {
          console.log('Heartbeat ping successful');
        });
      } else if (isNetworkAvailable) {
        // Socket reports as disconnected during the heartbeat
        console.log('Heartbeat detected disconnection, attempting to reconnect...');
        connectSocket();
      }
    }, 30000); // 30 seconds
  }, [isNetworkAvailable]);

// Simplified connection management
const connectSocket = useCallback(() => {
  if (!userId || !userToken || !isNetworkAvailable) {
    console.log('Cannot connect: missing auth or network');
    setConnectionStatus('disconnected');
    return;
  }

  // Clear existing connections and timers
  if (socketRef.current) {
    socketRef.current.disconnect();
  }
  
  if (reconnectTimerRef.current) {
    clearTimeout(reconnectTimerRef.current);
  }

  console.log('Connecting to socket...');
  setConnectionStatus('connecting');

  const newSocket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    timeout: 20000,
    reconnection: false, // Handle reconnection manually
    forceNew: true,
    query: { deviceId: userId, token: userToken }
  });

  // Simplified event handlers
  newSocket.on('connect', () => {
    console.log('Socket connected');
    setConnectionStatus('connected');
    setConnectionAttempts(0);
    
    if (expoPushToken) {
      newSocket.emit('register_device', { deviceToken: expoPushToken, userId });
    }
  });

  newSocket.on('disconnect', () => {
    console.log('Socket disconnected');
    setConnectionStatus('disconnected');
    scheduleReconnect();
  });

  newSocket.on('connect_error', (error) => {
    console.log('Connection error:', error.message);
    setConnectionStatus('disconnected');
    scheduleReconnect();
  });

  socketRef.current = newSocket;
  setSocket(newSocket);
}, [userId, userToken, isNetworkAvailable, expoPushToken]);

// Separate reconnection scheduling
const scheduleReconnect = useCallback(() => {
  if (reconnectTimerRef.current) return; // Prevent multiple timers
  
  setConnectionAttempts(prev => {
    const newAttempts = prev + 1;
    const delay = Math.min(1000 * (2 ** prev), 30000); // Exponential backoff
    
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${newAttempts})`);
    
    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      if (newAttempts < 10) {
        connectSocket();
      }
    }, delay);
    
    return newAttempts;
  });
}, [connectSocket]);

  const sendPushNotification = async (message: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Emergency Alert!',
          body: message,
          sound: true,
          priority: 'high',
          vibrate: [0, 250, 250, 250],
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  };

  // Function to test push notifications
  const sendTestPushNotification = async () => {
    if (!expoPushToken) {
      Alert.alert('No Push Token', 'Push token has not been registered yet.');
      return;
    }
    
    // Send a local notification for testing
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Test Emergency Alert',
        body: 'This is a test emergency notification',
        sound: true,
        priority: 'high',
        vibrate: [0, 250, 250, 250],
      },
      trigger: null, // Send immediately
    });
    
    Alert.alert('Test Notification Sent', 'Check your device notifications.');
  };

  // Attempt to reconnect manually
  const manualReconnect = () => {
    // Check if we actually need to reconnect
    if (connectionStatus === 'connected' && socketRef.current?.connected) {
      Alert.alert('Already Connected', 'You are already connected to the emergency system.');
      return;
    }
    
    // Force a new connection attempt
    setConnectionAttempts(0);
    connectSocket();
    
    Alert.alert('Reconnecting', 'Attempting to reconnect to emergency services...');
  };

  const handleEmergency = async () => {
    // Ensure user is authenticated
    if (!userId || !userToken) {
      Alert.alert('Authentication Required', 'Please log in again to continue.');
      router.replace('./');
      return;
    }

    // Double-check connection status before proceeding
    if (!socketRef.current?.connected || connectionStatus !== 'connected') {
      Alert.alert(
        'Not Connected',
        'Unable to send emergency signal while offline. Please wait for reconnection or check your internet connection.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Try Reconnecting', onPress: manualReconnect }
        ]
      );
      return;
    }

    try {
      setIsLoading(true);
      Vibration.vibrate([0, 500, 200, 500]);

      // Prepare the emergency data
      const emergencyData: EmergencyData = {
        senderId: userId,
        message: `Emergency at ${hostelname} with ${sickness}`,
        pushToken: expoPushToken || undefined
      };

      // Send via both socket and HTTP for redundancy
      const socketPromise = new Promise<string>((resolve, reject) => {
        if (socketRef.current?.connected) {
          socketRef.current.emit('emergency_broadcast', emergencyData, (acknowledgement: EmergencyAcknowledgement) => {
            if (acknowledgement && acknowledgement.success) {
              resolve('Socket emergency broadcast successful');
            } else {
              console.log('Emergency broadcast not acknowledged, will try HTTP');
            }
          });
          
          // Add a timeout in case the acknowledgement never comes
          setTimeout(() => {
            resolve('Socket emergency broadcast timeout (continuing with HTTP)');
          }, 5000);
        } else {
          reject(new Error('Socket not connected'));
        }
      });

      // Send HTTP request using axios instead of fetch
      const httpPromise = axiosInstance.post('/api/alerts', emergencyData)
        .then(response => {
          // Axios automatically throws for error status codes 
          // and parses JSON responses
          return response.data;
        });

      // Wait for either method to succeed
      try {
        await Promise.any([socketPromise, httpPromise]);
        console.log('Emergency Signal Sent through at least one channel');
        
        // Navigate to Emergency Ring
        router.push('/(EmergencyAction)/EmergencyRing');
      } catch (error) {
        throw new Error('All emergency signal methods failed');
      }
      
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to send emergency signal. Please try again.'
      );
      console.error('Emergency Signal Error:', error);
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

  // Function to render the connection status indicator
  const renderConnectionStatus = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, styles.connectedIndicator]} />
            <Text style={styles.statusText}>Connected to Emergency System</Text>
          </View>
        );
      case 'connecting':
        return (
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, styles.connectingIndicator]} />
            <Text style={styles.statusText}>
              Connecting to Emergency System
              {connectionAttempts > 0 ? ` (Attempt ${connectionAttempts})` : ''}
            </Text>
          </View>
        );
      case 'disconnected':
        return (
          <View style={styles.statusContainer}>
            <TouchableOpacity onPress={manualReconnect} style={styles.reconnectButton}>
              <View style={[styles.statusIndicator, styles.disconnectedIndicator]} />
              <Text style={styles.statusText}>
                {!isNetworkAvailable 
                  ? 'No Network Connection' 
                  : `Disconnected - Tap to reconnect${connectionAttempts > 0 ? ` (Attempt ${connectionAttempts})` : ''}`}
              </Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Connection status indicator at the top */}
      {renderConnectionStatus()}
      
      <TouchableOpacity 
        onPress={confirmEmergency}
        style={[
          styles.emergencyButton, 
          isLoading && styles.emergencyButtonDisabled,
          connectionStatus !== 'connected' && styles.emergencyButtonDisabled
        ]}
        disabled={isLoading || connectionStatus !== 'connected'}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          <>
            <Image source={images.EmergencyOff} style={styles.buttonImage} />
            <Text style={styles.text}>
              {connectionStatus === 'connected' 
                ? 'Click the Emergency Button' 
                : isNetworkAvailable 
                  ? 'Connecting to emergency services...' 
                  : 'No network connection. Check internet'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {hostelname && sickness && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Location: {hostelname}</Text>
          <Text style={styles.infoText}>Condition: {sickness}</Text>
        </View>
      )}

      {/* Test notification button - you can remove this in production */}
      {__DEV__ && (
        <TouchableOpacity onPress={sendTestPushNotification} style={styles.testButton}>
          <Text style={styles.testButtonText}>Test Notification</Text>
        </TouchableOpacity>
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
  emergencyButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emergencyButtonDisabled: {
    opacity: 0.7,
  },
  buttonImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    borderRadius: 180,
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
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
  // Connection status styles
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
  connectedIndicator: {
    backgroundColor: '#4CAF50', // Green
  },
  connectingIndicator: {
    backgroundColor: '#FFC107', // Yellow/amber
  },
  disconnectedIndicator: {
    backgroundColor: '#F44336', // Red
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
  },
  reconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  // Test notification button - for development only
  testButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
  }
});

export default EmergencyPage;