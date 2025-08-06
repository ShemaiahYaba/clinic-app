import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useGlobal } from '../components/GlobalContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerEmergencyAlert } from '@/utils/database';
import { LinearGradient } from 'expo-linear-gradient';
import { emergencyTypesConfig, EmergencyType } from '@/constants/EmergencyTypes';

type FlowStep = 'selectType' | 'selectHostel' | 'confirmDetails';


const hostelOptions = [
  "NEW ELIZABETH HALL",
  "NEW DANIEL HALL",
  "DANIEL HALL",
  "ELIZABETH HALL 1",
  "ELIZABETH HALL 2",
  "ELIZABETH HALL 3",
];

export default function EmergencyReportPage() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<FlowStep>('selectType');
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyType | null>(null);
  const [selectedHostel, setSelectedHostel] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slide up animation state for the trigger button
  const slideUpAnim = useRef(new Animated.Value(0)).current;

  // Access global context for emergency alert
  const { addEmergencyAlert } = useGlobal();

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

  const handleAnimatedSubmit = () => {
    if (isSubmitting) return;
    Animated.timing(slideUpAnim, {
      toValue: -60, // Slide up by 60px
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      handleSubmitReport();
      setTimeout(() => {
        slideUpAnim.setValue(0); // Reset for next time
      }, 1000);
    });
  };

  const handleSubmitReport = async () => {
    console.log('handleSubmitReport called');
    if (!selectedEmergency || !selectedHostel) return;
    setIsSubmitting(true);
    
    try {
      // Get device ID
      const senderDeviceId = await AsyncStorage.getItem('device_id');
      if (!senderDeviceId) {
        Toast.show({
          type: 'error',
          text1: 'Device Not Registered',
          text2: 'You must register your device before sending an alert.',
        });
        setIsSubmitting(false);
        return;
      }
      // Create the emergency alert in Supabase and trigger notification
      const message = `${selectedEmergency} at ${selectedHostel}`;
      console.log('Submitting emergency report:', { message, senderDeviceId });
      const result = await triggerEmergencyAlert(senderDeviceId, message, selectedHostel);
      
      console.log('Emergency report result:', result);
      
      if (result.success) {
        await addEmergencyAlert({
          id: result.data.id,
          message,
          status: 'active',
          location: selectedHostel,
          sender_device_id: senderDeviceId,
          created_at: new Date().toISOString(),
          resolved_at: undefined,
        });
        Toast.show({
          type: 'success',
          text1: 'Alert Triggered!',
          text2: `${selectedEmergency} at ${selectedHostel} reported. Help is on the way.`,
        });
        setStep('selectType');
        setSelectedEmergency(null);
        setSelectedHostel(null);
        setIsSubmitting(false);
        router.push('/(tabs)/home');
      } else {
        console.error('Emergency report failed:', result.error);
        Toast.show({
          type: 'error',
          text1: 'Failed to Report',
          text2: result.error || 'Unable to send emergency alert. Please try again.',
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Emergency report error:', error);
      Toast.show({
        type: 'error',
        text1: 'Connection Error',
        text2: 'Unable to connect to emergency services. Please check your connection.',
      });
      setIsSubmitting(false);
    }
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
    // Reset state before navigating
    setStep('selectType');
    setSelectedEmergency(null);
    setSelectedHostel(null);
    setIsSubmitting(false);
    
    // Navigate back to home screen
    router.push('/(tabs)/home');
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
                <Ionicons name={emergency.icon as any} size={40} color={emergency.color} />
                <Text style={[styles.emergencyText, { color: emergency.color }]}>
                  {emergency.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    if (step === 'selectHostel' && selectedEmergency) {
      return (
        <View style={styles.container}>
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Select Hostel</Text>
            <View style={styles.hostelListWrapper}>
              {hostelOptions.map((hostel) => (
                <TouchableOpacity
                  key={hostel}
                  style={[
                    styles.hostelListItem,
                    selectedHostel === hostel && styles.selectedHostelListItem,
                  ]}
                  onPress={() => setSelectedHostel(hostel)}
                >
                  <Text
                    style={[
                      styles.hostelListItemText,
                      selectedHostel === hostel && styles.selectedHostelListItemText,
                    ]}
                  >
                    {hostel}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      );
    }

    if (step === 'confirmDetails' && selectedEmergency && selectedHostel) {
      return (
        <View style={styles.container}>
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
            <View style={styles.roundButtonContainer}>
              <Animated.View style={[styles.animatedRoundButton, { transform: [{ translateY: slideUpAnim }] }]}> 
                <TouchableOpacity
                  style={styles.outerRing}
                  onPress={handleAnimatedSubmit}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#ff4e50", "#d90429"]}
                    start={{ x: 0.1, y: 0.1 }}
                    end={{ x: 0.9, y: 0.9 }}
                    style={styles.innerButton}
                >
                  {isSubmitting ? (
                      <ActivityIndicator color="#fff" size={48} />
                  ) : (
                      <Text style={styles.confirmButtonText}>CONFIRM</Text>
                  )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
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
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>
        
      </ScrollView>

      {/* Fixed Footer */}
      <View style={[styles.fixedFooter, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.footerContent}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          {step === 'selectHostel' && (
            <TouchableOpacity 
              style={[styles.nextButton, !selectedHostel && styles.disabledButton]} 
              onPress={handleHostelConfirm}
              disabled={!selectedHostel || isSubmitting}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 8,
  },
  hostelListWrapper: {
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  hostelListItem: {
    padding: 20,
  },
  selectedHostelListItem: {
    backgroundColor: '#e5e7eb',
  },
  hostelListItemText: {
    fontSize: 20,
    fontWeight: '500',
  },
  selectedHostelListItemText: {
    fontWeight: '600',
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
    fontSize: 20,
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
    fontSize: 20,
    fontWeight: '600',
  },
  confirmButtons: {
    marginTop: 50,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  roundButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    width: '50%',
    position: 'relative',
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingVertical: 16,
  },
  animatedRoundButton: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 80,
  },
  roundTriggerButton: {
    width: 180,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#dc2626',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  contentContainer: {
    padding: 16,
  },
  fixedFooter: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostelSwitchItem: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 28,
    backgroundColor: '#f1f5f9',
    marginRight: 12,
  },
  hostelSwitchItemText: {
    fontSize: 22,
    color: '#1e293b',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  selectedHostelSwitchItem: {
    backgroundColor: '#2563eb',
    borderWidth: 3,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  selectedHostelSwitchItemText: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1,
    fontSize: 24,
  },
  outerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
    borderWidth: 3,
    borderColor: '#bdbdbd',
  },
  innerButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffb3b3',
  },
  confirmButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: '#d90429',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 2,
  },
}); 