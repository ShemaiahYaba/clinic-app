import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { isAuthenticated } from '@/lib/auth';

export default function Index() {
  if (isAuthenticated()) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/splash" />;
}
