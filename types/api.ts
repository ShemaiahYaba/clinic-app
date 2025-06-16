export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserData {
  id: string;
  email: string;
  name?: string;
  session?: {
    access_token: string;
  };
}

export interface EmergencyAlertData {
  id: string;
  message: string;
  status: 'active' | 'resolved';
  created_at: string;
  sender_id: string;
} 