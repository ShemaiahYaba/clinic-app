import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Pressable } from 'react-native';
import React from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter, Link } from 'expo-router';
import { useGlobal } from '@/components/GlobalSearch'; 

const HostelPage = () => {
  const router = useRouter();
  const { setHostelname } = useGlobal(); // Correct usage of context

  const handleSelectHostel = async (hostelName) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
      setHostelname(hostelName); // Save hostel globally
      console.log(`Selected hostel: ${hostelName}`);
      router.push('/(EmergenySelection)/SicknessPage'); // Navigate
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={styles.container}>    
      <Link asChild href={'/'}>
        <Pressable>
          <AntDesign name="arrowleft" size={30} color="white" style={{ marginTop: 29, marginLeft: 10 }} />
        </Pressable>
      </Link>
      <View style={styles.hostelContainer}>
        <Text style={styles.header}>Select Hostel</Text>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {[
            'New Elizabeth Hall', 'Elizabeth 1', 'Elizabeth 2', 'Elizabeth 3', 
            'Guest House', 'Daniel 1', 'House of Daniel', 'Regional House', 'Chapel'
          ].map((hostel, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.hostelButton} 
              onPress={() => handleSelectHostel(hostel)}>
              <Text style={styles.hostelText}>{hostel}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default HostelPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'blue',
  },
  hostelContainer: {
    backgroundColor: 'white',
    marginTop: 37,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 10,
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  header: {
    fontSize: 25,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  hostelButton: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'black',
    marginVertical: 14,
  },
  hostelText: {
    fontSize: 20,
    padding: 14,
  },
});
