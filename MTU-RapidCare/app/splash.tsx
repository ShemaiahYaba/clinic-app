import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { AppLogo } from '@/components/Logo';
import { isAuthenticated } from '@/lib/auth';

export default function SplashScreen() {
  const progress = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start progress animation
    Animated.timing(progress, {
      toValue: 1,
      duration: 5000, // 5 seconds
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // Navigate after animation completes
    const timer = setTimeout(() => {
      if (isAuthenticated()) {
        router.replace('/');
      } else {
        router.replace('/auth');
      }
    }, 5000); // Match the animation duration

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AppLogo size={120} />
        <Text style={styles.title}>MTU-RapidCare</Text>
        <Text style={styles.subtitle}>Emergency Response System</Text>
        
        <View style={styles.progressContainer}>
          <Animated.View 
            style={[
              styles.progressBar,
              {
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]} 
          />
        </View>
      </View>
      
      <Text style={styles.copyright}>
        © {new Date().getFullYear()} MTU-RAPIDCARE. All rights reserved.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    padding: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#2563eb',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: '#64748b',
    textAlign: 'center',
  },
  progressContainer: {
    width: '80%',
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 40,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  copyright: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
  },
}); 