export const ValidationRules = {
  email: (email: string) => {
    if (!email) return 'Email is required';
    if (!email.includes('@')) return 'Invalid email format';
    return null;
  },
  
  password: (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  },
  
  name: (name: string) => {
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    return null;
  },
  
  message: (message: string) => {
    if (!message) return 'Message is required';
    if (message.length > 500) return 'Message must be less than 500 characters';
    return null;
  },
  
  hostelName: (name: string) => {
    if (!name) return 'Hostel name is required';
    return null;
  },
  
  sickness: (condition: string) => {
    if (!condition) return 'Medical condition is required';
    return null;
  }
};

export const validateForm = (values: Record<string, string>, rules: Record<string, (value: string) => string | null>) => {
  const errors: Record<string, string> = {};
  
  Object.keys(rules).forEach(key => {
    const error = rules[key](values[key]);
    if (error) {
      errors[key] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 