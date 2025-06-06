import React, { FC } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
} from "react-native";

interface InputProps {
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  error?: string | null;
}

const Input: React.FC<InputProps> = ({
  value,
  setValue,
  placeholder,
  secureTextEntry,
  error,
}) => {
  return (
    <View>
      <View style={[styles.container, ...(error ? [styles.errorContainer] : [])]}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          style={styles.input}
          secureTextEntry={secureTextEntry}
          textAlign="left"
          autoCapitalize="none"
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    width: "90%",
    borderRadius: 8,
   
   
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginVertical: 10,
    marginHorizontal: 10,
   
  },
  input: {
    flex: 1,
    paddingLeft: 10,
  },
  errorContainer: {
    borderColor: "red",
  },
  error: {
    color: "red",
    marginTop: 5,
    marginLeft: 10,
  },
});