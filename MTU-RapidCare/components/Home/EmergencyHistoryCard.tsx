import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type EmergencyStatus = "Resolved" | "Pending" | "Active";

interface EmergencyReport {
  id: string;
  type: "Heart Attack" | "Accident" | "Fire" | "Other";
  date: string;
  time: string;
  status: EmergencyStatus;
  details?: string;
}

const mockEmergencyHistory: EmergencyReport[] = [
  { id: "1", type: "Accident", date: "2024-07-15", time: "14:30", status: "Resolved", details: "Minor collision, no injuries." },
  { id: "2", type: "Heart Attack", date: "2024-07-10", time: "09:15", status: "Resolved", details: "Patient stabilized and transported." },
  { id: "3", type: "Fire", date: "2024-06-28", time: "18:00", status: "Active", details: "Small kitchen fire, contained." },
  { id: "4", type: "Other", date: "2024-06-20", time: "11:00", status: "Pending", details: "Lost pet reported in the area." },
  { id: "5", type: "Accident", date: "2024-05-05", time: "10:20", status: "Resolved", details: "Bike incident, minor scrapes." },
];

const getEmergencyIcon = (type: EmergencyReport["type"]) => {
  switch (type) {
    case "Heart Attack": return <Ionicons name="heart" size={20} color="#ef4444" />;
    case "Accident": return <Ionicons name="car" size={20} color="#eab308" />;
    case "Fire": return <Ionicons name="flame" size={20} color="#f97316" />;
    case "Other": return <Ionicons name="shield" size={20} color="#3b82f6" />;
    default: return <Ionicons name="alert-circle" size={20} color="#6b7280" />;
  }
};

const getStatusIcon = (status: EmergencyStatus) => {
  switch(status) {
    case "Resolved": return <Ionicons name="checkmark-circle" size={16} color="#16a34a" />;
    case "Pending": return <Ionicons name="time" size={16} color="#ca8a04" />;
    case "Active": return <Ionicons name="alert-circle" size={16} color="#dc2626" />;
  }
};

const getStatusColor = (status: EmergencyStatus) => {
  switch (status) {
    case "Resolved": return "#16a34a";
    case "Pending": return "#ca8a04";
    case "Active": return "#dc2626";
    default: return "#6b7280";
  }
};

export function EmergencyHistoryCard() {
  const [history, setHistory] = useState<EmergencyReport[]>([]);

  useEffect(() => {
    // Simulate fetching data
    setHistory(mockEmergencyHistory);
  }, []);

  if (history.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Emergency History</Text>
          <Text style={styles.cardDescription}>No past emergencies reported.</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.emptyText}>Your reported emergencies will appear here.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Emergency History</Text>
        <Text style={styles.cardDescription}>Overview of your past reported emergencies.</Text>
      </View>
      <View style={styles.cardContent}>
        <ScrollView style={styles.scrollArea}>
          {history.map((report) => (
            <TouchableOpacity 
              key={report.id} 
              style={styles.emergencyItem}
              activeOpacity={0.7}
            >
              <View style={styles.emergencyHeader}>
                <View style={styles.emergencyInfo}>
                  {getEmergencyIcon(report.type)}
                  <View style={styles.emergencyTextContainer}>
                    <Text style={styles.emergencyType}>{report.type}</Text>
                    <Text style={styles.emergencyDateTime}>
                      {report.date} at {report.time}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
                  {getStatusIcon(report.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                    {report.status}
                  </Text>
                </View>
              </View>
              {report.details && (
                <Text style={styles.detailsText}>
                  Details: {report.details}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  cardContent: {
    padding: 16,
  },
  scrollArea: {
    maxHeight: 300,
  },
  emergencyItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  emergencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emergencyTextContainer: {
    gap: 4,
  },
  emergencyType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  emergencyDateTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailsText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    marginLeft: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    paddingVertical: 16,
  },
}); 