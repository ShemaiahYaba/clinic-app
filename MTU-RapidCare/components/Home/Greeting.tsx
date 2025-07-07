import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IconName = 'sunny' | 'partly-sunny' | 'moon';

interface GreetingData {
  greeting: string;
  icon: IconName;
  subText: string;
  color: string;
}

export function Greeting() {
  const [greetingData, setGreetingData] = useState<GreetingData>({
    greeting: 'Welcome',
    icon: 'sunny',
    subText: 'Ready to assist you. Stay safe.',
    color: '#2563eb'
  });

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      const currentDate = new Date();
      const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      const timeString = currentDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });

      let newGreetingData: GreetingData;

      if (currentHour >= 5 && currentHour < 12) {
        // Morning: 5 AM - 11:59 AM
        const isEarlyMorning = currentHour === 5;
        newGreetingData = {
          greeting: isEarlyMorning ? 'Rise and shine' : 'Good morning',
          icon: 'sunny',
          subText: isEarlyMorning 
            ? `It's ${dayOfWeek}, ${timeString}. Early bird catches the worm! 🌅`
            : `It's ${dayOfWeek}, ${timeString}. Have a great day ahead!`,
          color: '#f59e0b'
        };
      } else if (currentHour >= 12 && currentHour < 17) {
        // Afternoon: 12 PM - 4:59 PM
        newGreetingData = {
          greeting: 'Good afternoon',
          icon: 'partly-sunny',
          subText: `It's ${dayOfWeek}, ${timeString}. Hope your day is going well!`,
          color: '#2563eb'
        };
      } else if (currentHour >= 17 && currentHour < 21) {
        // Evening: 5 PM - 8:59 PM
        newGreetingData = {
          greeting: 'Good evening',
          icon: 'partly-sunny',
          subText: `It's ${dayOfWeek}, ${timeString}. Winding down for the day.`,
          color: '#7c3aed'
        };
      } else {
        // Night: 9 PM - 4:59 AM
        newGreetingData = {
          greeting: 'Good night',
          icon: 'moon',
          subText: `It's ${dayOfWeek}, ${timeString}. Rest well and stay safe.`,
          color: '#1e40af'
        };
      }

      setGreetingData(newGreetingData);
    };

    // Update greeting immediately
    updateGreeting();

    // Update greeting every minute to keep time current
    const interval = setInterval(updateGreeting, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name={greetingData.icon} 
          size={40} 
          color={greetingData.color} 
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.greetingText}>
          {greetingData.greeting}, <Text style={[styles.highlightText, { color: greetingData.color }]}>MTU</Text>!
        </Text>
        <Text style={styles.subText}>{greetingData.subText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  textContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  highlightText: {
    fontWeight: '800',
  },
  subText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 16,
    fontWeight: '500',
  },
}); 