import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IconName = 'sunny' | 'partly-sunny' | 'moon';

export function Greeting() {
  const [greeting, setGreeting] = useState('');
  const [greetingIcon, setGreetingIcon] = useState<IconName>('sunny');

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good morning');
      setGreetingIcon('sunny');
    } else if (currentHour < 18) {
      setGreeting('Good afternoon');
      setGreetingIcon('partly-sunny');
    } else {
      setGreeting('Good evening');
      setGreetingIcon('moon');
    }
  }, []);

  if (greetingIcon === 'sunny') {
    return (
      <View style={styles.container}>
        <Ionicons name="sunny" size={32} color="#2563eb" />
        <Text style={styles.welcomeText}>Welcome!</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Ionicons name={greetingIcon} size={40} color="#2563eb" />
      <View style={styles.textContainer}>
        <Text style={styles.greetingText}>
          {greeting}, <Text style={styles.highlightText}>MTU</Text>!
        </Text>
        <Text style={styles.subText}>Ready to assist you. Stay safe.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  highlightText: {
    color: '#2563eb',
  },
  subText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
}); 