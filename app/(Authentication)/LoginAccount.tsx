import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { useGlobal } from '../../components/GlobalSearch';
import axios from 'axios';

export default function LoginAccount() {
  const { setUserAuth, isLoading, error, resetError } = useGlobal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginAccount = async () => {
    try {
      resetError();

      const res = await axios.post('https://api-hexa.onrender.com/api/users/login', {
        email,
        password,
      });

      const { userId, token } = res.data;
      await setUserAuth(userId, token);
      router.push('/(EmergenySelection)/HostelPage');
    } catch (err: any) {
      console.error('Login error:', err?.response?.data || err.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, marginTop: 100 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Login to Your Account</Text>

      <View style={{ marginVertical: 10 }}>
        <Text style={{ marginBottom: 5 }}>Email</Text>
        <TextInput
          style={{ borderWidth: 1, borderColor: 'gray', height: 40, borderRadius: 4, padding: 10 }}
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={{ marginVertical: 10 }}>
        <Text style={{ marginBottom: 5 }}>Password</Text>
        <TextInput
          style={{ borderWidth: 1, borderColor: 'gray', height: 40, borderRadius: 4, padding: 10 }}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {error && <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>}

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <Pressable
          onPress={loginAccount}
          style={{
            backgroundColor: 'black',
            padding: 15,
            borderRadius: 5,
            alignItems: 'center',
            marginTop: 10,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Login</Text>
        </Pressable>
      )}
    </View>
  );
}
