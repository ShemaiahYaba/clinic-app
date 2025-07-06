import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EmergencyActionButtons from './EmergencyActionButtons';

// Accepts the emergencyAlert object as a prop (optional)
export default function EmergencyDetails({ 
  emergencyAlert, 
  onDismiss 
}: { 
  emergencyAlert?: { 
    id?: string;
    isActive: boolean; 
    details: string; 
    timestamp: number | null; 
    status?: string;
    location?: string;
    isSender?: boolean;
    resolved_at?: string;
  };
  onDismiss?: () => void;
}) {
  if (!emergencyAlert || !emergencyAlert.details) return null;

  // Try to parse details (format: 'Type at Location')
  let type = '', location = '';
  const match = emergencyAlert.details.match(/^(.*?) at (.*)$/);
  if (match) {
    type = match[1];
    location = match[2];
  } else {
    type = emergencyAlert.details;
    location = emergencyAlert.location || '';
  }

  const time = emergencyAlert.timestamp
    ? new Date(emergencyAlert.timestamp).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      })
    : '';

  const resolvedTime = emergencyAlert.resolved_at
    ? new Date(emergencyAlert.resolved_at).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      })
    : '';

  // Status badge color
  const status = emergencyAlert.status || 'Active';
  const statusColor = status.toLowerCase() === 'resolved' ? '#22c55e' : '#f59e42';
  const statusBg = status.toLowerCase() === 'resolved' ? '#dcfce7' : '#fef3c7';
  const iconName = type.toLowerCase().includes('fire') ? 'flame' : type.toLowerCase().includes('accident') ? 'car' : type.toLowerCase().includes('heart') ? 'heart' : 'alert-circle';
  const iconColor = '#2563eb';

  return (
    <View style={styles.outerWrap}>
      <View style={styles.accentBar} />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Ionicons name={iconName as any} size={32} color={iconColor} style={{ marginRight: 10 }} />
          <Text style={styles.heading}>Emergency Details</Text>
          <View style={styles.headerActions}>
            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}> 
              <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
            </View>
            {onDismiss && (
              <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.detailSection}>
          <Text style={styles.label}>Type</Text>
          <Text style={styles.value}>{type}</Text>
        </View>
        {location ? (
          <View style={styles.detailSection}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{location}</Text>
          </View>
        ) : null}
        {time ? (
          <View style={styles.detailSection}>
            <Text style={styles.label}>Reported</Text>
            <Text style={styles.value}>{time}</Text>
          </View>
        ) : null}
        {resolvedTime && status === 'resolved' ? (
          <View style={styles.detailSection}>
            <Text style={styles.label}>Resolved</Text>
            <Text style={styles.value}>{resolvedTime}</Text>
          </View>
        ) : null}
        
        <EmergencyActionButtons
          alertId={emergencyAlert.id}
          status={status}
          onDismiss={onDismiss}
          showResolve={true}
          showDismiss={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  accentBar: {
    width: 6,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    backgroundColor: '#2563eb',
  },
  container: {
    flex: 1,
    padding: 20,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: '#f8fafc',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginRight: 8,
  },
  statusText: {
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailSection: {
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    color: '#64748b',
    fontSize: 14,
    marginBottom: 2,
  },
  value: {
    fontSize: 18,
    color: '#1e293b',
    fontWeight: '500',
  },
}); 