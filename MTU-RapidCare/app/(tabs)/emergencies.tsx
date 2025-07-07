import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRefresh } from '@/components/RefreshContext';
import { getActiveAlerts } from '@/utils/database';
import { useGlobal } from '@/components/GlobalContext';
import { router } from 'expo-router';
import { format, parseISO } from 'date-fns';

interface Alert {
  id: string;
  created_at: string;
  message: string;
  status: string;
  location?: string;
  sender_device_id?: string;
  resolved_at?: string;
  extra_data?: {
    emergencyType?: string;
    [key: string]: any;
  };
}

type GroupedAlerts = {
  [date: string]: Alert[];
};

const EMERGENCY_TYPES = [
  'All',
  'Heart Attack',
  'Accident',
  'Fire',
  'Other',
];

function groupAlertsByDay(alerts: Alert[], filterType: string): GroupedAlerts {
  const grouped: GroupedAlerts = {};
  alerts.forEach((alert) => {
    if (filterType !== 'All' && alert.extra_data?.emergencyType !== filterType) return;
    const date = format(parseISO(alert.created_at), 'yyyy-MM-dd');
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(alert);
  });
  return grouped;
}

export default function EmergenciesScreen() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { refreshing, refreshAll, registerFetcher, unregisterFetcher } = useRefresh();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterType, setFilterType] = useState<string>('All');
  const { refreshAlerts, isConnected } = useGlobal();
  const insets = useSafeAreaInsets();

  const loadAlerts = useCallback(async () => {
    try {
      const result = await getActiveAlerts();
      if (result.success && result.data) {
        setAlerts(result.data);
      } else {
        setAlerts([]);
      }
    } catch (error) {
      setAlerts([]);
    }
  }, []);

  // Load alerts on mount and when refresh is triggered
  useEffect(() => {
    loadAlerts();
    registerFetcher(loadAlerts);
    return () => unregisterFetcher(loadAlerts);
  }, [loadAlerts, registerFetcher, unregisterFetcher]);

  // Listen for real-time updates from GlobalContext
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        loadAlerts();
      }
    }, 5000); // Refresh every 5 seconds when connected

    return () => clearInterval(interval);
  }, [loadAlerts, isConnected]);

  const groupedAlerts: GroupedAlerts = groupAlertsByDay(alerts, filterType);
  const sortedDates = Object.keys(groupedAlerts).sort((a, b) => b.localeCompare(a));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergencies</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="filter-outline" size={20} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20, // Add safe area bottom + extra padding
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshAll}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      >
        
        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyStateTitle}>No Emergencies</Text>
            <Text style={styles.emptyStateText}>
              You haven't reported any emergencies yet.
            </Text>
            <TouchableOpacity style={styles.reportButton} onPress={() => router.push('/emergency-report')}>
              <Text style={styles.reportButtonText}>Report Emergency</Text>
            </TouchableOpacity>
            
          </View>
        ) : (
          <View style={styles.emergencyList}>
            {sortedDates.map(date => (
              <View key={date} style={styles.daySection}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayTitle}>{format(parseISO(date), 'EEEE, MMM d, yyyy')}</Text>
                  <Text style={styles.dayCount}>{groupedAlerts[date].length} {groupedAlerts[date].length === 1 ? 'alert' : 'alerts'}</Text>
                </View>
                {groupedAlerts[date].map(alert => (
                  <TouchableOpacity
                    key={alert.id}
                    style={[
                      styles.alertCard,
                      alert.status === 'resolved' && styles.resolvedAlertCard
                    ]}
                    onPress={() => router.push({ pathname: '/emergency-details', params: { id: alert.id } })}
                  >
                    <View style={styles.alertRow}>
                      <Ionicons 
                        name="alert-circle" 
                        size={24} 
                        color={alert.status === 'resolved' ? '#22c55e' : '#dc2626'} 
                        style={{ marginRight: 8 }} 
                      />
                      <Text style={[
                        styles.alertType,
                        alert.status === 'resolved' && styles.resolvedAlertType
                      ]}>
                        {alert.extra_data?.emergencyType || 'Unknown'}
                      </Text>
                      <View style={[
                        styles.statusBadge,
                        alert.status === 'resolved' ? styles.resolvedStatusBadge : styles.activeStatusBadge
                      ]}>
                        <Text style={[
                          styles.statusText,
                          alert.status === 'resolved' ? styles.resolvedStatusText : styles.activeStatusText
                        ]}>
                          {alert.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                    <Text style={styles.alertLocation}>Location: {alert.location || 'N/A'}</Text>
                    <Text style={styles.alertTime}>{format(parseISO(alert.created_at), 'hh:mm a')}</Text>
                    {alert.resolved_at && alert.status === 'resolved' && (
                      <Text style={styles.resolvedTime}>Resolved: {format(parseISO(alert.resolved_at), 'MMM d, hh:mm a')}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Emergency Type</Text>
            {EMERGENCY_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.filterOption, filterType === type && styles.selectedFilterOption]}
                onPress={() => {
                  setFilterType(type);
                  setFilterModalVisible(false);
                }}
              >
                <Text style={[styles.filterOptionText, filterType === type && styles.selectedFilterOptionText]}>{type}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setFilterModalVisible(false)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  reportButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  reportButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
  emergencyList: {
    padding: 20,
  },
  daySection: {
    marginBottom: 32,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
  },
  dayCount: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'Poppins-Medium',
  },
  alertCard: {
    backgroundColor: '#fff1f2',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  resolvedAlertCard: {
    backgroundColor: '#f0fdf4',
    opacity: 0.8,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  alertType: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#dc2626',
    marginRight: 8,
  },
  resolvedAlertType: {
    color: '#22c55e',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  activeStatusBadge: {
    backgroundColor: '#fef3c7',
  },
  resolvedStatusBadge: {
    backgroundColor: '#dcfce7',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeStatusText: {
    color: '#f59e42',
  },
  resolvedStatusText: {
    color: '#22c55e',
  },
  alertMessage: {
    fontSize: 15,
    color: '#1e293b',
    marginBottom: 2,
    fontFamily: 'Poppins-Medium',
  },
  alertLocation: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: 'Poppins-Regular',
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: 'Poppins-Regular',
    marginBottom: 2,
  },
  resolvedTime: {
    fontSize: 13,
    color: '#22c55e',
    fontFamily: 'Poppins-Medium',
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1e293b',
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f1f5f9',
    width: '100%',
    alignItems: 'center',
  },
  selectedFilterOption: {
    backgroundColor: '#2563eb',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#1e293b',
    fontFamily: 'Poppins-Medium',
  },
  selectedFilterOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeModalButton: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeModalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#2563eb',
    marginBottom: 8,
  },
}); 