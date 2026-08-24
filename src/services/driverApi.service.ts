import { apiClient } from './api';

export interface DriverProfile {
  driver_id: string;
  name: string;
  email: string;
  phone: string;
  nic_no: string;
  license_no: string;
  license_class: string;
  license_expiry: string;
}

export interface AssignedVehicle {
  vehicle_id: string;
  registration_number: string;
  model: string;
  seating_capacity: number;
}

export interface AuthResponse {
  token: string;
  profile: DriverProfile;
  assigned_vehicle: AssignedVehicle;
}

export interface DashboardData {
  summary: {
    today_passengers: number;
    today_fuel_liters: number;
    next_doc_expiry_days: number;
  };
  driver: {
    driver_id: string;
    name: string;
    license_number: string;
  };
  vehicle: {
    vehicle_id: string;
    registration_number: string;
    model: string;
  };
  active_trip: {
    trip_id: string;
    status: string;
    route_number: string;
    route_name: string;
    start_location: string;
    end_location: string;
    current_halt_index: number;
    passenger_count: number;
    start_time: string;
  } | null;
}

export const DriverApiService = {
  // 1. Auth
  login: async (identifier: string, password: string):Promise<{ success: boolean; data: AuthResponse; message: string }> => {
    return apiClient.post('/driver/auth/login', { identifier, password });
  },

  register: async (data: any): Promise<{ success: boolean; data: any; message: string }> => {
    return apiClient.post('/driver/auth/register', data);
  },

  getProfile: async (): Promise<{ success: boolean; data: { profile: DriverProfile; assigned_vehicle: AssignedVehicle }; message: string }> => {
    return apiClient.get('/driver/profile');
  },

  updateProfile: async (data: { name?: string; phone?: string }): Promise<{ success: boolean; data: any; message: string }> => {
    return apiClient.put('/driver/profile', data);
  },

  // 2. Dashboard
  getDashboard: async (): Promise<{ success: boolean; data: DashboardData; message: string }> => {
    return apiClient.get('/driver/dashboard');
  },

  // 3. Halts & Trips
  getActiveTripHalts: async (): Promise<{ success: boolean; data: { trip_id: string; route_id: string; current_halt_index: number; halts: any[] }; message: string }> => {
    return apiClient.get('/driver/trips/active/halts');
  },

  updateHalt: async (haltId: string, data: { name?: string; sequence_no?: number }): Promise<any> => {
    return apiClient.patch(`/driver/trips/halts/${haltId}`, data);
  },

  startTrip: async (route_id: string): Promise<any> => {
    return apiClient.post('/driver/trips/start', { route_id });
  },

  completeHalt: async (payload: { trip_id: string; halt_id: string; sequence_no: number; boarded_passengers?: number }): Promise<any> => {
    return apiClient.post('/driver/trips/halts/complete', payload);
  },

  pingLocation: async (payload: { trip_id: string; latitude: number; longitude: number; speed?: number }): Promise<any> => {
    return apiClient.post('/driver/location/ping', payload);
  },

  finishTrip: async (trip_id: string): Promise<any> => {
    return apiClient.post('/driver/trips/finish', { trip_id });
  },

  // 4. Breakdowns
  reportBreakdown: async (payload: { reason: string; location: string; notes: string; trip_id?: string }): Promise<any> => {
    return apiClient.post('/driver/breakdowns', payload);
  },

  // 5. Documents
  getDocuments: async (): Promise<{ success: boolean; data: { warning_count: number; has_urgent_warning: boolean; documents: any[] }; message: string }> => {
    return apiClient.get('/driver/documents');
  },

  uploadDocument: async (payload: { document_type: string; expires_at: string; file_url: string; category: string }): Promise<any> => {
    return apiClient.post('/driver/documents/upload', payload);
  },

  // 6. Costs & Fuel
  getCosts: async (): Promise<{ success: boolean; data: { today_total: number; monthly_total: number; recent_logs: any[] }; message: string }> => {
    return apiClient.get('/driver/costs');
  },

  logCost: async (payload: { maintenance_type: 'FUEL' | 'REPAIR'; amount: number; liters?: number; description: string }): Promise<any> => {
    return apiClient.post('/driver/costs', payload);
  },
};
