import { ApiResponse } from '@/types/api';
import { ERROR_MESSAGES } from '@/config/constants';

/**
 * Main API error handler
 */
export const handleApiError = (error: unknown): ApiResponse<never> => {
  console.error('API Error:', error);
  
  let errorMessage: string = ERROR_MESSAGES.UNEXPECTED_ERROR;
  let status = 500;

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = (error as any).message;
    status = (error as any).status || 500;
  }

  return {
    success: false,
    error: errorMessage
  };
};

/**
 * Validation error handler
 */
export const handleValidationError = (error: any): ApiResponse => {
  return {
    success: false,
    error: error.message || ERROR_MESSAGES.VALIDATION_ERROR
  };
};

/**
 * Network error handler
 */
export const handleNetworkError = (error: any): ApiResponse => {
  return {
    success: false,
    error: ERROR_MESSAGES.NETWORK_ERROR
  };
};

/**
 * Database error handler
 */
export const handleDatabaseError = <T = void>(error: any): ApiResponse<T> => {
  // Check for unique constraint violation (duplicate expo_token)
  if (error && error.code === '23505' && error.message && error.message.includes('expo_token')) {
    return {
      success: false,
      error: 'Device is already registered.'
    };
  }
  return {
    success: false,
    error: ERROR_MESSAGES.DATABASE_ERROR
  };
};

/**
 * Emergency-specific error handler
 */
export const handleEmergencyError = <T = void>(error: any): ApiResponse<T> => {
  return {
    success: false,
    error: ERROR_MESSAGES.EMERGENCY_ERROR
  };
};