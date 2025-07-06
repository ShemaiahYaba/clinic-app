import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRealtimeStatus } from '@/components/GlobalContext';

export default function RealtimeStatusIndicator() {
  const { status, message, isConnected } = useRealtimeStatus();

  // Always show the status indicator

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

  const getStatusIcon = () => {
    switch (status) {
      case 'connecting':
        return 'sync';
      case 'disconnected':
        return 'wifi-outline';
      case 'connected':
        return 'wifi';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() + '20' }]}>
      <Ionicons 
        name={getStatusIcon() as any} 
        size={16} 
        color={getStatusColor()} 
        style={styles.icon}
      />
      <Text style={[styles.message, { color: getStatusColor() }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  icon: {
    marginRight: 8,
  },
  message: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 