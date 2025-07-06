import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Props: emergencyAlert object from GlobalContext
export default function LatestEmergencyCard({ 
  emergencyAlert 
}: { 
  emergencyAlert: { 
    id?: string;
    isActive: boolean; 
    details: string; 
    timestamp: number | null;
    status?: string;
    location?: string;
  } 
}) {
  if (!emergencyAlert.details) return null;

  // Format timestamp if available
  const time = emergencyAlert.timestamp ? new Date(emergencyAlert.timestamp).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  }) : '';

  // Status-based styling
  const isResolved = emergencyAlert.status === 'resolved';
  const iconColor = isResolved ? '#22c55e' : '#dc2626';
  const cardStyle = isResolved ? styles.resolvedCard : styles.activeCard;
  const titleStyle = isResolved ? styles.resolvedTitle : styles.activeTitle;

  const handlePress = () => {
    if (emergencyAlert.id) {
      router.push({ pathname: '/emergency-details', params: { id: emergencyAlert.id } });
    }
  };

  return (
    <TouchableOpacity style={[styles.card, cardStyle]} onPress={handlePress}>
      <Ionicons name="alert-circle" size={28} color={iconColor} style={{ marginRight: 12 }} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, titleStyle]}>
            {isResolved ? 'Resolved Emergency' : 'Latest Emergency'}
          </Text>
          {emergencyAlert.status && (
            <View style={[
              styles.statusBadge,
              isResolved ? styles.resolvedStatusBadge : styles.activeStatusBadge
            ]}>
              <Text style={[
                styles.statusText,
                isResolved ? styles.resolvedStatusText : styles.activeStatusText
              ]}>
                {emergencyAlert.status}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.details}>{emergencyAlert.details}</Text>
        {time ? <Text style={styles.time}>{time}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#64748b" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  activeCard: {
    backgroundColor: '#fff1f2',
  },
  resolvedCard: {
    backgroundColor: '#f0fdf4',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 2,
  },
  activeTitle: {
    color: '#dc2626',
  },
  resolvedTitle: {
    color: '#22c55e',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeStatusBadge: {
    backgroundColor: '#fef3c7',
  },
  resolvedStatusBadge: {
    backgroundColor: '#dcfce7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeStatusText: {
    color: '#f59e42',
  },
  resolvedStatusText: {
    color: '#22c55e',
  },
  details: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
}); 