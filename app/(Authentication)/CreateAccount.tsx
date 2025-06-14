import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { registerUser } from "@/services/authService"; // Make sure path is correct
import { showErrorToast, showSuccessToast } from "@/utils/toast";

const CreateAccount = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateAccount = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please fill all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await registerUser({ name, email, password });

      showSuccessToast("Account created! Verify your email.");
      router.push("/LoginAccount");
    } catch (error: any) {
      if (error.message.toLowerCase().includes("user already")) {
        showErrorToast("An account with this email already exists.");
      } else {
        showErrorToast(error.message || "Failed to create account.");
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
          {isLoading ? "Creating Account..." : "Register"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/LoginAccount")}>
        <Text style={{ color: "black", marginTop: 20, textAlign: "center" }}>
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
    backgroundColor: "white",
    padding: 20,
    justifyContent: "center",
    fontFamily: "poppins",
  },
  header: {
    fontSize: 26,
    color: "black",
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    color: "#ccc",
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    height: 50,
    backgroundColor: "#white",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#444",
  },
  button: {
    backgroundColor: "blue",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#666",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
