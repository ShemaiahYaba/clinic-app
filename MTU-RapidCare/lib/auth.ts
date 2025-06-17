// Basic auth implementation
// In a real app, this would connect to your backend API

interface User {
  fullname: string;
  email?: string;
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simple auth state management
let currentUser: User | null = null;

export function isAuthenticated(): boolean {
  return currentUser !== null;
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export async function loginUser(fullname: string, email?: string): Promise<User> {
  // Simulate API call
  await delay(1000);
  
  // In a real app, you would validate credentials with your backend
  if (!fullname) {
    throw new Error('Invalid credentials');
  }

  currentUser = {
    fullname,
    email,
  };

  return currentUser;
}

export async function signupUser(fullname: string, email: string): Promise<User> {
  // Simulate API call
  await delay(1000);

  // In a real app, you would create a new user in your backend
  if (!fullname || !email) {
    throw new Error('Invalid signup data');
  }

  currentUser = {
    fullname,
    email,
  };

  return currentUser;
}

export function logoutUser(): void {
  currentUser = null;
} 