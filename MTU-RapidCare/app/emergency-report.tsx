import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

type EmergencyType = "Heart Attack" | "Accident" | "Fire" | "Other";
type FlowStep = 'selectType' | 'selectHostel' | 'confirmDetails';

const emergencyTypesConfig = [
  { 
    name: "Heart Attack" as EmergencyType, 
    icon: "heart", 
    color: "#ef4444",
    bgColor: "#fee2e2"
  },
  { 
    name: "Accident" as EmergencyType, 
    icon: "car", 
    color: "#eab308",
    bgColor: "#fef9c3"
  },
  { 
    name: "Fire" as EmergencyType, 
    icon: "flame", 
    color: "#f97316",
    bgColor: "#ffedd5"
  },
  { 
    name: "Other" as EmergencyType, 
    icon: "shield", 
    color: "#3b82f6",
    bgColor: "#dbeafe"
  },
  { 
    name: "Other" as EmergencyType, 
    icon: "shield", 
    color: "#3b82f6",
    bgColor: "#dbeafe"
  },
  { 
    name: "Other" as EmergencyType, 
    icon: "shield", 
    color: "#3b82f6",
    bgColor: "#dbeafe"
  },
] as const;

const hostelOptions = [
  "NEW ELIZABETH HALL",
  "NEW DANIEL HALL",
  "DANIEL HALL",
  "ELIZABETH HALL 1",
  "ELIZABETH HALL 2",
  "ELIZABETH HALL 3",
];

export default function EmergencyReportPage() {
  const [step, setStep] = useState<FlowStep>('selectType');
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyType | null>(null);
  const [selectedHostel, setSelectedHostel] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeSelect = (emergencyType: EmergencyType) => {
    setSelectedEmergency(emergencyType);
    setStep('selectHostel');
  };

  const handleHostelConfirm = () => {
    if (selectedHostel) {
      setStep('confirmDetails');
    } else {
      Toast.show({
        type: 'error',
        text1: 'Hostel Not Selected',
        text2: 'Please select a hostel to proceed.',
      });
    }
  };

  const handleSubmitReport = () => {
    if (!selectedEmergency || !selectedHostel) return;
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log(`Emergency Reported: ${selectedEmergency} at ${selectedHostel}.`);
      Toast.show({
        type: 'success',
        text1: 'Alert Triggered!',
        text2: `${selectedEmergency} at ${selectedHostel} reported. Help is on the way.`,
      });
      // Reset state for next time
      setStep('selectType');
      setSelectedEmergency(null);
      setSelectedHostel(null);
      setIsSubmitting(false);
      router.back(); // Navigate back to home
    }, 1500);
  };

  const handleBack = () => {
    if (step === 'confirmDetails') {
      setStep('selectHostel');
    } else if (step === 'selectHostel') {
      setStep('selectType');
      setSelectedHostel(null);
    } else {
      router.back(); // Go back to home if on first step
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const renderContent = () => {
    if (step === 'selectType') {
      return (
        <View style={styles.container}>
          <Text style={styles.description}>
            Choose the nature of the emergency. You will select the location next.
          </Text>
          <View style={styles.grid}>
            {emergencyTypesConfig.map((emergency) => (
              <TouchableOpacity
                key={emergency.name}
                style={[styles.emergencyButton, { backgroundColor: emergency.bgColor }]}
                onPress={() => handleTypeSelect(emergency.name)}
              >
                <Ionicons name={emergency.icon} size={40} color={emergency.color} />
                <Text style={[styles.emergencyText, { color: emergency.color }]}>
                  {emergency.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (step === 'selectHostel' && selectedEmergency) {
      return (
        <View style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={16} color="#6b7280" />
            <Text style={styles.backButtonText}>Back to types</Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            Selected Emergency: <Text style={styles.highlight}>{selectedEmergency}</Text>
          </Text>

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Select Hostel</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedHostel}
                onValueChange={(value) => setSelectedHostel(value)}
                style={styles.picker}
              >
                <Picker.Item label="Choose a hostel..." value="" />
                {hostelOptions.map(hostel => (
                  <Picker.Item key={hostel} label={hostel} value={hostel} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.locationInfo}>
            <Ionicons name="location" size={14} color="#2563eb" />
            <Text style={styles.locationText}>Your location will be shared upon confirmation.</Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={isSubmitting}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.nextButton, !selectedHostel && styles.disabledButton]} 
              onPress={handleHostelConfirm}
              disabled={!selectedHostel || isSubmitting}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (step === 'confirmDetails' && selectedEmergency && selectedHostel) {
      return (
        <View style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={16} color="#6b7280" />
            <Text style={styles.backButtonText}>Back to select hostel</Text>
          </TouchableOpacity>

          <Text style={styles.confirmTitle}>Confirm Report Details</Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="shield" size={24} color="#2563eb" />
              <View>
                <Text style={styles.detailLabel}>Emergency Type:</Text>
                <Text style={styles.detailValue}>{selectedEmergency}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="business" size={24} color="#2563eb" />
              <View>
                <Text style={styles.detailLabel}>Hostel:</Text>
                <Text style={styles.detailValue}>{selectedHostel}</Text>
              </View>
            </View>
          </View>

          <View style={styles.confirmButtons}>
            <TouchableOpacity 
              style={[styles.triggerButton, isSubmitting && styles.disabledButton]} 
              onPress={handleSubmitReport}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.triggerButtonText}>Trigger Alert</Text>
                  <Ionicons name="send" size={16} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.cancelButton, styles.fullWidth]} 
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  const getHeaderTitle = () => {
    switch (step) {
      case 'selectType':
        return 'Report Emergency';
      case 'selectHostel':
        return 'Select Location';
      case 'confirmDetails':
        return 'Confirm Report';
      default:
        return 'Report Emergency';
    }
  };

  return (
    <View style={styles.pageContainer}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    zIndex: 1000,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  emergencyButton: {
    flex: 1,
    minWidth: '45%',
    aspectRatio: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emergencyText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  highlight: {
    color: '#2563eb',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  picker: {
    height: 50,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
  },
  nextButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  nextButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#374151',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtons: {
    marginTop: 24,
    gap: 12,
  },
  triggerButton: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 8,
  },
  triggerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
}); 