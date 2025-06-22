import { supabase } from "@/utils/supabaseClient"; // or wherever your Supabase client is initialized
import * as Notifications from 'expo-notifications';
import { registerDeviceToken } from "./deviceService";

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  success: boolean;
  error?: string;
  user?: any;
  session?: any; // <-- add this line
}

// const redirectTo =
//   typeof window !== "undefined"
//     ? `${window.location.origin}/verify`
//     : undefined;

export async function registerUser({ email, password, name }: RegisterInput): Promise<AuthResponse> {
  try {
    console.log('Starting user registration process...');
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // First, attempt to sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (signUpError) {
      console.error('Supabase signup error details:', {
        message: signUpError.message,
        status: signUpError.status,
        name: signUpError.name
      });
      throw signUpError;
    }

    if (!authData.user) {
      throw new Error('No user data returned from signup');
    }

    console.log('User created successfully:', authData.user.id);

    // After successful signup, register the device token
    try {
      const token = await registerDeviceToken(authData.user.id);
      if (token) {
        console.log('Device token registered successfully');
      }
    } catch (deviceError) {
      // Log device registration error but don't fail the signup
      console.error('Device registration error:', deviceError);
    }

    return {
      success: true,
      user: authData.user
    };

  } catch (error: any) {
    console.error('Registration error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    let errorMessage = 'An error occurred during registration';
    
    if (error.message.includes('already registered')) {
      errorMessage = 'This email is already registered';
    } else if (error.message.includes('invalid email')) {
      errorMessage = 'Please enter a valid email address';
    } else if (error.message.includes('password')) {
      errorMessage = 'Password must be at least 6 characters';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return {
      success: true,
      user: data.user,
      session: data.session
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message || 'Failed to login'
    };
  }
}

export async function logoutUser(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return {
      success: true
    };
  } catch (error: any) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.message || 'Failed to logout'
    };
  }
}
