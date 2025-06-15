import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import { useGlobal } from "../../components/GlobalSearch";
import { loginUser } from "@/services/authService";
import { Ionicons } from '@expo/vector-icons';

export default function LoginAccount() {
  const { setUserAuth, isLoading, error, resetError } = useGlobal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please enter both email and password.");
      return;
    }

    try {
      resetError();

      const response = await loginUser(email, password);

      if (!response.success) {
        Alert.alert("Login Error", response.error || "Failed to login");
        return;
      }

      if (response.user?.id) {
        await setUserAuth(response.user.id, response.user.session?.access_token);
        router.push("/(EmergenySelection)/HostelPage");
      } else {
        Alert.alert("Login Error", "Unexpected response from server.");
      }
    } catch (err: any) {
      console.error("Login error:", err.message);
      Alert.alert("Login Failed", err.message || "An error occurred.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, marginTop: 100 }}>
      {/* Back Button */}
      <Pressable 
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          padding: 10,
          zIndex: 1
        }}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </Pressable>

      <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20 }}>
        Login to Your Account
      </Text>

      <View style={{ marginVertical: 10 }}>
        <Text style={{ marginBottom: 5 }}>Email</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "gray",
            height: 40,
            borderRadius: 4,
            padding: 10,
          }}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={{ marginVertical: 10 }}>
        <Text style={{ marginBottom: 5 }}>Password</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "gray",
            height: 40,
            borderRadius: 4,
            padding: 10,
          }}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Enter your password"
        />
      </View>

      {error && <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>}

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <Pressable
          onPress={handleLogin}
          style={{
            backgroundColor: "black",
            padding: 15,
            borderRadius: 5,
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Login</Text>
        </Pressable>
      )}

      {/* Sign Up Link */}
      <Pressable 
        onPress={() => router.push('/CreateAccount')}
        style={{
          marginTop: 20,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: 'blue' }}>
          Don't have an account? <Text style={{ fontWeight: 'bold' }}>Sign Up</Text>
        </Text>
      </Pressable>
    </View>
  );
}
