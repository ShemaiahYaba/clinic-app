import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Animated, Text, ActivityIndicator, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import { useGlobal, useEmergencyAlert } from '@/components/GlobalSearch';
import images from '../../constants/Image';
import { router } from 'expo-router';

const EmergencyRing = () => {
  const { isActive: emergencyActive, isSender } = useEmergencyAlert();
  const [loading, setLoading] = useState(true);
  const [autoNavigateTimeout, setAutoNavigateTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const shakeTimeout = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const handleNotificationPress = () => {
    router.push('/(EmergencyAction)/ConfirmationPage');
  };

  const loadAlarmSound = async (): Promise<void> => {
    try {
      if (!soundRef.current) {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
        
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sound/emergency_alert.mp3'),
          { 
            shouldPlay: false, 
            isLooping: true,
            volume: 1.0,
          }
        );
        
        soundRef.current = sound;
      }
    } catch (error) {
      console.error('Error loading alarm sound:', error);
      soundRef.current = null;
    }
  };

  const startAlarm = async (): Promise<void> => {
    try {
      await loadAlarmSound();
      if (soundRef.current) {
        await soundRef.current.setVolumeAsync(1.0);
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error('Error playing alarm sound:', error);
      // Attempt to reload and retry once
      try {
        await loadAlarmSound();
        if (soundRef.current) {
          await soundRef.current.playAsync();
        }
      } catch (retryError) {
        console.error('Retry failed:', retryError);
      }
    }
  };

  const stopAlarm = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping alarm sound:', error);
      soundRef.current = null;
    }
  };

  const shake = () => {
    if (shakeTimeout.current) {
      clearTimeout(shakeTimeout.current);
    }

    const sequence = Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(sequence, { iterations: 3 }).start();

    shakeTimeout.current = setTimeout(() => {
      shakeAnim.setValue(0);
    }, 2000);
  };

  // Initialize alarm and auto-navigation
  useEffect(() => {
    const initializeRing = async () => {
      setLoading(true);
      await startAlarm();
      shake();
      setLoading(false);
    };

    initializeRing();

    // Auto-navigate after 5 seconds
    const timeout = setTimeout(() => {
      router.replace('/(EmergencyAction)/ConfirmationPage');
    }, 5000);

    setAutoNavigateTimeout(timeout);

    return () => {
      stopAlarm();
      if (autoNavigateTimeout) {
        clearTimeout(autoNavigateTimeout);
      }
      if (shakeTimeout.current) {
        clearTimeout(shakeTimeout.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.Image
        style={[styles.buttonImage, { transform: [{ translateX: shakeAnim }] }]}
        source={images.alertBell}
      />
      <Text style={styles.text}>EMERGENCY ALERT</Text>
      
      <Pressable style={styles.buttonAlert} onPress={handleNotificationPress}>
        <Text style={styles.buttonText}>View Details</Text>
      </Pressable>
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
  },
  buttonImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    borderRadius: 180,
  },
  text: {
    color: '#ffffff',
    fontSize: 46,
    fontWeight: '600',
    marginVertical: 20,
  },
  buttonAlert: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: "400"
  }
});

export default EmergencyRing;