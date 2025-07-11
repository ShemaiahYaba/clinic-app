import React from 'react';
import { router } from 'expo-router';
import CustomSplashScreen from '@/components/CustomSplashScreen';

export default function SplashScreen() {
  const handleComplete = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <CustomSplashScreen 
      onComplete={handleComplete}
      duration={3000} // 3 seconds
    />
  );
}