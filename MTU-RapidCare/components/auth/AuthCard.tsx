import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppLogo } from '@/components/Logo';
import { AuthTabs } from './AuthTabs';

interface AuthCardProps {
  children: React.ReactNode;
  activeTab: 'login' | 'signup';
  onTabChange: (tab: 'login' | 'signup') => void;
}

export function AuthCard({ children, activeTab, onTabChange }: AuthCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.logoContainer}>
          <AppLogo size={64} />
        </View>
        <Text style={styles.title}>
          {activeTab === 'login' ? 'Welcome Back' : 'Welcome to'}
          {'\n'}
          <Text style={styles.titleHighlight}>MTU-RAPIDCARE</Text>
        </Text>
        <Text style={styles.description}>
          {activeTab === 'login' 
            ? 'Sign in to your account to continue'
            : 'Create an account to get started'
          }
        </Text>
      </View>
      <View style={styles.cardContent}>
        <AuthTabs activeTab={activeTab} onTabChange={onTabChange}>
          {children}
        </AuthTabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  titleHighlight: {
    color: '#2563eb',
  },
  description: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
  },
}); 