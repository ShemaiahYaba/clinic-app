import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEmergencyAlert } from '@/components/GlobalContext';

interface EmergencyActionButtonsProps {
  alertId?: string;
  status?: string;
  onDismiss?: () => void;
  showResolve?: boolean;
  showDismiss?: boolean;
}

/**
 * Modular component for emergency alert action buttons
 * 
 * @example
 * // Full functionality (resolve + dismiss)
 * <EmergencyActionButtons
 *   alertId="123"
 *   status="active"
 *   onDismiss={() => router.back()}
 * />
 * 
 * @example
 * // Only resolve button (for admin views)
 * <EmergencyActionButtons
 *   alertId="123"
 *   status="active"
 *   showDismiss={false}
 * />
 * 
 * @example
 * // Only dismiss button (for read-only views)
 * <EmergencyActionButtons
 *   onDismiss={() => router.back()}
 *   showResolve={false}
 * />
 */
export default function EmergencyActionButtons({
  alertId,
  status = 'active',
  onDismiss,
  showResolve = true,
  showDismiss = true
}: EmergencyActionButtonsProps) {
  const { resolveAlert, isConnected } = useEmergencyAlert();

  const handleResolve = async () => {
    if (alertId) {
      try {
        console.log('Resolving alert:', alertId);
        await resolveAlert(alertId);
        console.log('Alert resolved successfully');
      } catch (error) {
        console.error('Error resolving alert:', error);
        // Silent error handling
      }
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  // Don't render if no actions are needed
  if (!showResolve && !showDismiss) {
    return null;
  }

  return (
    <View style={styles.actionSection}>
      {showResolve && alertId && status === 'active' && (
        <TouchableOpacity 
          style={styles.resolveButton} 
          onPress={handleResolve}
          disabled={!isConnected}
        >
          <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
          <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
        </TouchableOpacity>
      )}
      
      {showDismiss && onDismiss && (
        <TouchableOpacity 
          style={styles.dismissButton} 
          onPress={handleDismiss}
        >
          <Ionicons name="close-circle" size={20} color="#64748b" />
          <Text style={styles.dismissButtonText}>Dismiss Alert</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  resolveButton: {
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  resolveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  dismissButton: {
    backgroundColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dismissButtonText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 16,
  },
}); 