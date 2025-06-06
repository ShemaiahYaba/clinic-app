import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

const CreateAccount = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateAccount = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please fill all fields.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('https://api-hexa.onrender.com/api/users/register', {
        name,
        email,
        password,
      });

      // If axios request succeeds, response.status is 2xx
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => router.push('/LoginAccount'),
        },
      ]);
    } catch (error: any) {
      // Handle errors
      if (error.response) {
        // The request was made and the server responded with a status code outside 2xx
        const message = error.response.data?.message || 'Failed to create account';

        if (message.toLowerCase().includes('already')) {
          Alert.alert('User Exists', 'An account with this email already exists.');
        } else {
          Alert.alert('Error', message);
        }
      } else if (error.request) {
        // The request was made but no response was received
        Alert.alert('Error', 'No response from server. Please try again later.');
      } else {
        // Something happened in setting up the request
        Alert.alert('Error', error.message || 'Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Account</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        placeholderTextColor="#aaa"
        editable={!isLoading}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        placeholderTextColor="#aaa"
        secureTextEntry
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleCreateAccount}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Creating Account...' : 'Register'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/LoginAccount')}>
        <Text style={{ color: '#4CAF50', marginTop: 20, textAlign: 'center' }}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateAccount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 26,
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    color: '#ccc',
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    height: 50,
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
