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

      const { user, session } = await loginUser({ email, password });

      // Save user session/token however your app handles it
      const userId = user?.id;
      const token = session?.access_token;

      if (userId && token) {
        await setUserAuth(userId, token);
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
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
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
    </View>
  );
}
