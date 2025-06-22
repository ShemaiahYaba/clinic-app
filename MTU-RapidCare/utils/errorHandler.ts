import { ApiResponse } from '@/types/api';

export const handleApiError = (error: any): ApiResponse => {
  console.error('API Error:', error);
  
  let errorMessage = 'An unexpected error occurred';
  let status = 500;

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.message) {
    errorMessage = error.message;
    status = error.status || 500;
  }

  return {
    success: false,
    error: errorMessage
  };
};

export const handleValidationError = (error: any): ApiResponse => {
  return {
    success: false,
    error: error.message || 'Validation failed'
  };
};

export const handleAuthError = (error: any): ApiResponse => {
  return {
    success: false,
    error: error.message || 'Authentication failed'
  };
};