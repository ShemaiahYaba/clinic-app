import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type TabType = 'login' | 'signup';

interface AuthTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  children: React.ReactNode;
}

export function AuthTabs({ activeTab, onTabChange, children }: AuthTabsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabsList}>
        <TouchableOpacity
          style={[
            styles.tabTrigger,
            activeTab === 'login' && styles.activeTabTrigger
          ]}
          onPress={() => onTabChange('login')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'login' && styles.activeTabText
          ]}>
            Sign In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabTrigger,
            activeTab === 'signup' && styles.activeTabTrigger
          ]}
          onPress={() => onTabChange('signup')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'signup' && styles.activeTabText
          ]}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContent}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  tabsList: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 16,
  },
  tabTrigger: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabTrigger: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#2563eb',
    fontFamily: 'Poppins-Medium',
  },
  tabContent: {
    width: '100%',
  },
}); 