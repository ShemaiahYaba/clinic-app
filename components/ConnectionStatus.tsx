import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  if (isConnected) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, styles.disconnectedIndicator]} />
      <Text style={styles.text}>Not connected to alert system</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    position: 'absolute',
    top: 50,
    zIndex: 100,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  disconnectedIndicator: {
    backgroundColor: '#F44336',
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
  },
}); 