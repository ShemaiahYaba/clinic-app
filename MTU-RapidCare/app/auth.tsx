import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AuthForm } from '@/components/auth/AuthForm';
import { AuthCard } from '@/components/auth/AuthCard';
import { useAuthPage } from '@/hooks/useAuthPage';

export default function AuthPage() {
  const { activeTab, handleTabChange } = useAuthPage();

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <AuthCard activeTab={activeTab} onTabChange={handleTabChange}>
        <AuthForm mode={activeTab} />
      </AuthCard>

      <Text style={styles.footer}>
        &copy; {new Date().getFullYear()} MTU-Rapidcare. Secure and Swift.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 24,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
}); 