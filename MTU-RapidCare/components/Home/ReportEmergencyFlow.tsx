import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { triggerEmergency } from '@/utils/emergency';
import { useToast } from '@/hooks/useToast';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EDGE_FUNCTION_URL = "https://oxhjrszqngdyvbixxyvo.supabase.co/functions/v1/send-push-alert";

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
] as const;

const hostelOptions = [
  "NEW ELIZABETH HALL",
  "NEW DANIEL HALL",
  "DANIEL HALL",
  "ELIZABETH HALL 1",
  "ELIZABETH HALL 2",
  "ELIZABETH HALL 3",
];

interface ReportEmergencyFlowProps {
  onSubmitted: () => void;
  onCancel: () => void;
}

export function ReportEmergencyFlow({ onSubmitted, onCancel }: ReportEmergencyFlowProps) {
  const [step, setStep] = useState<FlowStep>('selectType');
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyType | null>(null);
  const [selectedHostel, setSelectedHostel] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { show } = useToast();

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

  const handleSubmitReport = async () => {
    if (!selectedEmergency || !selectedHostel) return;
    setIsSubmitting(true);
    try {
      // Retrieve device ID from AsyncStorage
      const senderDeviceId = await AsyncStorage.getItem('device_id');
      if (!senderDeviceId) {
        show({ type: 'error', text1: 'Device not registered.' });
        setIsSubmitting(false);
        return;
      }
      const message = `${selectedEmergency} at ${selectedHostel}`;
      const location = selectedHostel;
      const extraData = { emergencyType: selectedEmergency };
      const result = await triggerEmergency(senderDeviceId, message, location, extraData);
      if (result.success) {
        // Call Edge Function to send notifications
        await fetch(EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender_device_id: senderDeviceId, message, location, extra_data: extraData })
        });
        show({ type: 'success', text1: 'Alert Triggered!', text2: `${selectedEmergency} at ${selectedHostel} reported. Help is on the way.` });
        setStep('selectType');
        setSelectedEmergency(null);
        setSelectedHostel(null);
        setIsSubmitting(false);
        onSubmitted();
      } else {
        show({ type: 'error', text1: result.error || 'Failed to trigger alert.' });
        setIsSubmitting(false);
      }
    } catch (e) {
      show({ type: 'error', text1: 'Failed to trigger alert.' });
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 'confirmDetails') {
      setStep('selectHostel');
    } else if (step === 'selectHostel') {
      setStep('selectType');
      setSelectedHostel(null);
    }
  };

  if (step === 'selectType') {
    return (
      <View style={styles.container}>
        <Text style={styles.description}>
          What type of emergency is it?
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
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
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
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={isSubmitting}>
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
            onPress={onCancel}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
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