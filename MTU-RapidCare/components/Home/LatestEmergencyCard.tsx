import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { EmergencyAlertData } from '@/types/api';
import { formatTimestamp } from '../../utils/format';

interface LatestEmergencyCardProps {
  emergencyAlert: EmergencyAlertData;
  loading?: boolean;
  error?: string | null;
}

const StatusIcon = ({ isResolved }: { isResolved: boolean }) => (
  <Ionicons
    name={isResolved ? 'checkmark-circle' : 'alert-circle'}
    size={28}
    color={isResolved ? '#22c55e' : '#dc2626'}
    style={{ marginRight: 12 }}
    accessibilityLabel={isResolved ? 'Resolved emergency' : 'Active emergency'}
  />
);

const LatestEmergencyCard: React.FC<LatestEmergencyCardProps> = memo(({ emergencyAlert, loading, error }) => {
  if (loading) {
    return (
      <View style={[styles.card, styles.activeCard, { justifyContent: 'center' }]}> 
        <ActivityIndicator size="small" color="#2563eb" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={[styles.card, styles.activeCard]}> 
        <Text style={styles.details}>Error: {error}</Text>
      </View>
    );
  }
  if (!emergencyAlert.message) {
    return (
      <View style={[styles.card, styles.resolvedCard]}> 
        <Text style={styles.details}>No emergencies reported.</Text>
      </View>
    );
  }
  const time = formatTimestamp(emergencyAlert.created_at ? new Date(emergencyAlert.created_at).getTime() : null);
  const isResolved = emergencyAlert.status === 'resolved';
  const cardStyle = isResolved ? styles.resolvedCard : styles.activeCard;
  const titleStyle = isResolved ? styles.resolvedTitle : styles.activeTitle;
  const handlePress = () => {
    if (emergencyAlert.id) {
      router.push({ pathname: '/emergency-details', params: { id: emergencyAlert.id } });
    }
  };
  return (
    <TouchableOpacity
      style={[styles.card, cardStyle]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${isResolved ? 'resolved' : 'active'} emergency`}
      activeOpacity={0.85}
    >
      <StatusIcon isResolved={isResolved} />
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
        <Text style={styles.details}>{emergencyAlert.message}</Text>
        {time ? <Text style={styles.time}>{time}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#64748b" />
    </TouchableOpacity>
  );
});

export default LatestEmergencyCard;

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