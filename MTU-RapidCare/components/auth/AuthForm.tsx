import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { loginUser, signupUser } from '@/lib/auth';
import { AppLogo } from '@/components/Logo';
import type { RootStackParamList, AppRoutes } from '@/app/types';

const loginSchema = z.object({
  identifier: z.string().min(1, { message: "Please enter your email or username." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signupSchema = z.object({
  fullname: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

type AuthFormProps = {
  mode: "login" | "signup";
};

function isLoginFormValues(values: LoginFormValues | SignupFormValues): values is LoginFormValues {
  return 'identifier' in values;
}

export function AuthForm({ mode }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues | SignupFormValues>({
    resolver: async (data) => {
      try {
        const schema = mode === "login" ? loginSchema : signupSchema;
        const result = await schema.parseAsync(data);
        return {
          values: result,
          errors: {},
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            values: {},
            errors: error.formErrors.fieldErrors,
          };
        }
        return {
          values: {},
          errors: {},
        };
      }
    },
    defaultValues: mode === "login"
      ? { identifier: "", password: "" }
      : { fullname: "", email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues | SignupFormValues) => {
    try {
      if (mode === "login") {
        const loginValues = values as LoginFormValues;
        const { identifier, password } = loginValues;
        
        let authFullname: string;
        let authEmail: string | undefined = undefined;

        if (identifier.includes('@')) {
          authEmail = identifier;
          authFullname = identifier.split('@')[0]?.trim() || "User";
        } else {
          authFullname = identifier.trim();
        }
        
        await loginUser(authFullname, authEmail);
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Welcome back!',
        });
      } else {
        const signupValues = values as SignupFormValues;
        const { fullname, email, password } = signupValues;
        await signupUser(fullname, email);
        Toast.show({
          type: 'success',
          text1: 'Signup Successful',
          text2: 'Welcome to MTU-RAPIDCARE!',
        });
      }
      router.replace('/(tabs)/home');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Failed',
        text2: (error as Error).message || "An unexpected error occurred.",
      });
    }
  };

  const getFieldError = (fieldName: string) => {
    const error = errors[fieldName as keyof typeof errors];
    return error?.message;
  };

  return (
    <View style={styles.container}>
      {mode === "signup" && (
        <Controller
          control={control}
          name="fullname"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your Full Name"
                  onChangeText={onChange}
                  value={value}
                />
              </View>
              {getFieldError('fullname') && (
                <Text style={styles.errorText}>{getFieldError('fullname')}</Text>
              )}
            </View>
          )}
        />
      )}

      <Controller
        control={control}
        name={mode === "login" ? "identifier" : "email"}
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {mode === 'login' ? 'Email or Username' : 'Email'}
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder={mode === 'login' ? 'your@email.com or username' : 'name@example.com'}
                onChangeText={onChange}
                value={value}
                keyboardType={mode === 'login' ? 'default' : 'email-address'}
                autoCapitalize="none"
              />
            </View>
            {mode === 'login' ? (
              getFieldError('identifier') && (
                <Text style={styles.errorText}>{getFieldError('identifier')}</Text>
              )
            ) : (
              getFieldError('email') && (
                <Text style={styles.errorText}>{getFieldError('email')}</Text>
              )
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                onChangeText={onChange}
                value={value}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {getFieldError('password') && (
              <Text style={styles.errorText}>{getFieldError('password')}</Text>
            )}
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.submitButtonText}>
          {mode === "login" ? "Sign In" : "Create Account"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  inputContainer: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1f2937',
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#ef4444',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
});