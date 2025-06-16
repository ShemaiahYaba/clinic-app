import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface EmergencyButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({ onPress, disabled }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, disabled && styles.buttonDisabled]}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>Trigger Emergency Alert</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ff3b30',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 