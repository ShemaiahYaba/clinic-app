export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface EmergencyAlertData {
  id: string;
  message: string;
  status: 'active' | 'resolved';
  created_at: string;
  sender_device_id: string;
  location?: string;
  resolved_at?: string;
  pending?: boolean; // For optimistic UI
} 