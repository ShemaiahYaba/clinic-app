import { ApiResponse } from '@/types/api';
import { ERROR_MESSAGES } from '@/config/constants';

export const handleApiError = (error: unknown): ApiResponse<never> => {
  console.error('API Error:', error);

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message
    };
  }

  return {
    success: false,
    error: ERROR_MESSAGES.UNEXPECTED_ERROR
  };
}; 