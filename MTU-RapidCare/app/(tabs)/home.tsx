import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppLogo } from '@/components/Logo';
import { Greeting } from '@/components/Home/Greeting';
import { EmergencyHistoryCard } from '@/components/Home/EmergencyHistoryCard';
import { ReportEmergencyFlow } from '@/components/Home/ReportEmergencyFlow';

export default function HomeScreen() {
  const [isEmergencyModalVisible, setIsEmergencyModalVisible] = useState(false);

  const handleEmergencySubmitted = () => {
    setIsEmergencyModalVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <AppLogo size={40} />
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>
        <Greeting />
      </View>

      <View style={styles.content}>
        <View style={styles.actionCard}>
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={() => setIsEmergencyModalVisible(true)}
          >
            <Ionicons name="alert-circle-outline" size={32} color="#dc2626" />
            <Text style={styles.emergencyButtonText}>Report Emergency</Text>
          </TouchableOpacity>
        </View>

        <EmergencyHistoryCard />
      </View>

      <Modal
        visible={isEmergencyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEmergencyModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ReportEmergencyFlow
              onSubmitted={handleEmergencySubmitted}
              onCancel={() => setIsEmergencyModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f8fafc',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyButton: {
    backgroundColor: '#fee2e2',
    padding: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#dc2626',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '90%',
  },
}); 