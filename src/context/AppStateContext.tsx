import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DriverApiService, DriverProfile, AssignedVehicle, DashboardData } from '../services/driverApi.service';

export interface HaltItem {
  id: string;
  name: string;
  sequenceNo: number;
  completed: boolean;
  waitingCount: number;
  dropCount: number;
  distanceKm: number;
  etaMin: number;
  latitude?: number;
  longitude?: number;
  // Backward compatibility aliases
  passengersWaiting?: number;
  passengersAlighting?: number;
  scheduledTime?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  category: 'driver' | 'vehicle';
  status: 'valid' | 'warning' | 'expired';
  expiryDate: string;
  daysRemaining?: number;
}

export interface CostItem {
  id: string;
  type: 'FUEL' | 'REPAIR';
  date: string;
  amount: number; // LKR
  liters?: number; // L for fuel
  stationOrDescription: string;
}

interface AppStateContextType {
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  isSyncing: boolean;
  driverName: string;
  driverPhone: string;
  driverEmail: string;
  driverLicenseNo: string;
  vehicleNo: string;
  vehicleModel: string;
  activeRoute: string;
  activeRouteName: string;
  passengersToday: number;
  fuelLoggedToday: number;
  tripStatus: 'idle' | 'halts_review' | 'active' | 'breakdown' | 'completed';
  tripStartTime: Date | null;
  tripElapsedTime: string;
  tripDurationMinutes: number;
  activeTripId: string;
  currentHaltIndex: number;
  halts: HaltItem[];
  documents: DocumentItem[];
  costs: CostItem[];
  totalFuelToday: number;
  totalRepairToday: number;
  totalFuelMonth: number;
  hasLocationPermission: boolean;
  setHasLocationPermission: (val: boolean) => void;
  login: (email?: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  signup: (details: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshDashboard: () => Promise<void>;
  refreshDocuments: () => Promise<void>;
  refreshCosts: () => Promise<void>;
  refreshHalts: () => Promise<void>;
  startTripReview: () => void;
  confirmStartTrip: () => Promise<void>;
  markHaltComplete: (haltId: string) => Promise<void>;
  reportBreakdown: (reason: string, notes: string) => Promise<{ success: boolean; message?: string }>;
  addCostLog: (log: Omit<CostItem, 'id'>) => Promise<void>;
  updateHaltName: (haltId: string, newName: string) => Promise<void>;
  updateProfileDetails: (name: string, phone: string) => Promise<{ success: boolean; message?: string }>;
  uploadDocument: (payload: { document_type: string; expires_at: string; file_url?: string; category: string }) => Promise<{ success: boolean; message?: string }>;
  finishTrip: () => Promise<any>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@smartbus_driver_auth';

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(true);

  // Driver and Vehicle Details (Populated dynamically from backend / DB)
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [driverLicenseNo, setDriverLicenseNo] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');

  // Dashboard & Active Trip State
  const [activeRouteId, setActiveRouteId] = useState<string>('');
  const [activeRoute, setActiveRoute] = useState<string>('No Active Route');
  const [activeRouteName, setActiveRouteName] = useState<string>('');
  const [passengersToday, setPassengersToday] = useState(0);
  const [fuelLoggedToday, setFuelLoggedToday] = useState(0);
  const [activeTripId, setActiveTripId] = useState<string>('');
  const [tripStatus, setTripStatus] = useState<'idle' | 'halts_review' | 'active' | 'breakdown' | 'completed'>('idle');
  const [tripStartTime, setTripStartTime] = useState<Date | null>(null);
  const [tripElapsedTime, setTripElapsedTime] = useState('00:00:00');
  const [tripDurationMinutes, setTripDurationMinutes] = useState(0);

  // Live Stopwatch Timer when trip is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (tripStatus === 'active' && tripStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diffMs = now.getTime() - tripStartTime.getTime();
        const totalSecs = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        setTripDurationMinutes(Math.max(1, Math.floor(totalSecs / 60)));
        setTripElapsedTime(
          `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        );
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tripStatus, tripStartTime]);

  // Halts (Loaded dynamically from database)
  const [currentHaltIndex, setCurrentHaltIndex] = useState(0);
  const [halts, setHalts] = useState<HaltItem[]>([]);

  // Documents (Loaded dynamically from database)
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  // Costs (Loaded dynamically from database)
  const [costs, setCosts] = useState<CostItem[]>([]);

  const [totalFuelToday, setTotalFuelToday] = useState(0);
  const [totalRepairToday, setTotalRepairToday] = useState(0);
  const [totalFuelMonth, setTotalFuelMonth] = useState(0);

  // Sync with real backend dashboard
  const refreshDashboard = useCallback(async () => {
    try {
      setIsSyncing(true);
      const res = await DriverApiService.getDashboard();
      if (res?.success && res.data) {
        const d = res.data;
        if (d.summary) {
          setPassengersToday(d.summary.today_passengers ?? 0);
          setFuelLoggedToday(d.summary.today_fuel_liters ?? 0);
        }
        if (d.driver) {
          setDriverName(d.driver.name);
          setDriverLicenseNo(d.driver.license_number);
        }
        if (d.vehicle) {
          setVehicleNo(d.vehicle.registration_number);
          setVehicleModel(d.vehicle.model);
        }
        if (d.active_trip) {
          setActiveTripId(d.active_trip.trip_id);
          setActiveRouteId((d.active_trip as any).route_id || d.active_trip.route_number);
          setActiveRoute(`Route ${d.active_trip.route_number}`);
          setActiveRouteName(d.active_trip.route_name);
          if (d.active_trip.status === 'IN_PROGRESS') {
            setTripStatus('active');
          }
          if (typeof d.active_trip.current_halt_index === 'number') {
            setCurrentHaltIndex(d.active_trip.current_halt_index);
          }
        }
      }
    } catch (err) {
      console.log('Backend dashboard sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Sync documents from backend
  const refreshDocuments = useCallback(async () => {
    try {
      const res = await DriverApiService.getDocuments();
      if (res?.success && res.data?.documents) {
        const mapped = res.data.documents.map((doc: any) => ({
          id: doc.document_id || `doc_${Math.random()}`,
          name: doc.document_type || 'Compliance Document',
          category: (doc.category?.toLowerCase() === 'driver' ? 'driver' : 'vehicle') as 'driver' | 'vehicle',
          status: (doc.status?.toLowerCase() === 'warning' ? 'warning' : doc.status?.toLowerCase() === 'expired' ? 'expired' : 'valid') as 'valid' | 'warning' | 'expired',
          expiryDate: doc.expires_at || '2026-12-31',
          daysRemaining: doc.days_remaining ?? 30,
        }));
        setDocuments(mapped);
      }
    } catch (err) {
      console.log('Backend documents sync error:', err);
    }
  }, []);

  // Sync costs from backend
  const refreshCosts = useCallback(async () => {
    try {
      const res = await DriverApiService.getCosts();
      if (res?.success && res.data) {
        if (typeof res.data.today_total === 'number') setTotalFuelToday(res.data.today_total);
        if (typeof res.data.monthly_total === 'number') setTotalFuelMonth(res.data.monthly_total);
        if (Array.isArray(res.data.recent_logs)) {
          const mapped = res.data.recent_logs.map((log: any) => ({
            id: log.maintenance_id || `maint_${Math.random()}`,
            type: (log.maintenance_type === 'REPAIR' ? 'REPAIR' : 'FUEL') as 'FUEL' | 'REPAIR',
            date: log.logged_at ? new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString(),
            amount: parseFloat(log.amount) || 0,
            liters: log.liters ? parseFloat(log.liters) : undefined,
            stationOrDescription: log.description || 'Expense Entry',
          }));
          setCosts(mapped);
        }
      }
    } catch (err) {
      console.log('Backend costs sync error:', err);
    }
  }, []);

  // Sync halts from backend
  const refreshHalts = useCallback(async () => {
    try {
      setIsSyncing(true);
      const res = await DriverApiService.getActiveTripHalts();
      if (res?.success && res.data) {
        const d = res.data;
        if (d.trip_id) setActiveTripId(d.trip_id);
        if (d.route_id) setActiveRouteId(d.route_id);
        if ((d as any).route_number) setActiveRoute(`Route ${(d as any).route_number}`);
        if ((d as any).route_name) setActiveRouteName((d as any).route_name);

        if (typeof d.current_halt_index === 'number') {
          setCurrentHaltIndex(d.current_halt_index);
        }

        if (Array.isArray(d.halts) && d.halts.length > 0) {
          const mapped: HaltItem[] = d.halts.map((h: any, idx: number) => ({
            id: h.halt_id || h.id || `h_${idx}`,
            name: h.name || h.halt_name || `Halt ${idx + 1}`,
            sequenceNo: h.sequence_no ?? h.sequenceNo ?? h.sequence_order ?? idx + 1,
            completed: typeof d.current_halt_index === 'number' ? idx < d.current_halt_index : false,
            waitingCount: h.waiting_passengers ?? h.waitingCount ?? (4 + (idx % 4)),
            dropCount: h.drop_passengers ?? h.dropCount ?? (idx > 0 ? 2 + (idx % 3) : 0),
            distanceKm: parseFloat(h.distance_km ?? h.distanceKm ?? (idx * 1.8)),
            etaMin: parseInt(h.eta_min ?? h.etaMin ?? h.travel_time_from_origin_mins ?? (idx * 6), 10),
            latitude: h.latitude ? parseFloat(h.latitude) : undefined,
            longitude: h.longitude ? parseFloat(h.longitude) : undefined,
            scheduledTime: h.scheduled_time || h.scheduledTime || undefined,
          }));
          setHalts(mapped);
        }
      }
    } catch (err) {
      console.log('Backend halts sync fallback:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [activeTripId]);

  // Restore saved login session on startup
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        const token = await AsyncStorage.getItem('userToken');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.isAuthenticated) {
            setIsAuthenticated(true);
            if (parsed.driverName) setDriverName(parsed.driverName);
            if (parsed.driverPhone) setDriverPhone(parsed.driverPhone);
            if (parsed.driverEmail) setDriverEmail(parsed.driverEmail);
          }
        }
        if (token) {
          // Fetch live profile and dashboard
          refreshDashboard();
          refreshDocuments();
          refreshCosts();
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setIsLoadingSession(false);
      }
    };
    restoreSession();
  }, [refreshDashboard, refreshDocuments, refreshCosts]);

  const saveAuthSession = async (auth: boolean, name?: string, phoneStr?: string, emailStr?: string, token?: string) => {
    try {
      const payload = {
        isAuthenticated: auth,
        driverName: name || driverName,
        driverPhone: phoneStr || driverPhone,
        driverEmail: emailStr || driverEmail,
      };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
      if (token) {
        await AsyncStorage.setItem('userToken', token);
      }
    } catch (err) {
      console.error('Failed to save auth session:', err);
    }
  };

  const login = async (identifier?: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    if (!identifier || !password) {
      return { success: false, message: 'Please enter your email/phone and password' };
    }
    try {
      const res = await DriverApiService.login(identifier, password);
      if (res?.success && res.data?.token) {
        const prof = res.data.profile;
        const veh = res.data.assigned_vehicle;
        if (prof?.name) setDriverName(prof.name);
        if (prof?.phone) setDriverPhone(prof.phone);
        if (prof?.email) setDriverEmail(prof.email);
        if (prof?.license_no) setDriverLicenseNo(prof.license_no);
        if (veh?.registration_number) {
          setVehicleNo(veh.registration_number);
          setVehicleModel(veh.model || 'Bus');
        }
        setIsAuthenticated(true);
        await saveAuthSession(true, prof?.name, prof?.phone, prof?.email, res.data.token);
        // Refresh all live driver data
        await Promise.all([
          refreshDashboard(),
          refreshDocuments(),
          refreshCosts(),
          refreshHalts(),
        ]);
        return { success: true, message: res.message || 'Login successful' };
      }
      return { success: false, message: res?.message || 'Login failed' };
    } catch (err: any) {
      console.log('Backend login error:', err.message);
      return { success: false, message: err.message || 'Invalid credentials' };
    }
  };

  const signup = async (details: any): Promise<{ success: boolean; message?: string }> => {
    const name = details.fullName || details.name;
    const phoneStr = details.phone;
    const emailStr = details.email;
    try {
      const res = await DriverApiService.register({
        name,
        email: emailStr,
        password: details.password || 'Password123!',
        phone: phoneStr,
        nic_number: details.nicNumber || '199600000001',
        license_number: details.licenseNumber || 'B1000001',
        license_class: details.licenseClass || 'Heavy Vehicle (Class A/B)',
        license_expiry: details.licenseExpiry || '2027-01-01',
      });
      if (res?.success && res.data?.token) {
        setDriverName(name);
        setDriverPhone(phoneStr);
        setDriverEmail(emailStr);
        setIsAuthenticated(true);
        await saveAuthSession(true, name, phoneStr, emailStr, res.data.token);
        await Promise.all([
          refreshDashboard(),
          refreshDocuments(),
          refreshCosts(),
          refreshHalts(),
        ]);
        return { success: true, message: res.message || 'Registered successfully' };
      }
      return { success: false, message: res?.message || 'Registration failed' };
    } catch (err: any) {
      console.log('Backend signup error:', err.message);
      return { success: false, message: err.message || 'Could not create account' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setDriverName('');
    setDriverPhone('');
    setDriverEmail('');
    setDriverLicenseNo('');
    setVehicleNo('');
    setVehicleModel('');
    setHalts([]);
    setDocuments([]);
    setCosts([]);
    setActiveTripId('');
    setTripStatus('idle');
    AsyncStorage.multiRemove([AUTH_STORAGE_KEY, 'userToken']).catch(console.error);
  };

  const startTripReview = () => {
    setTripStatus('halts_review');
    refreshHalts();
  };

  const confirmStartTrip = async () => {
    setTripStatus('active');
    setTripStartTime(new Date());
    setTripElapsedTime('00:00:00');
    try {
      const routeToStart = activeRouteId || 'route-138';
      const res = await DriverApiService.startTrip(routeToStart);
      if (res?.data?.trip_id) {
        setActiveTripId(res.data.trip_id);
      }
    } catch (err: any) {
      console.log('Backend startTrip error:', err.message);
      // If trip already exists today (unique constraint), fetch active trip id from DB
      try {
        const haltsRes = await DriverApiService.getActiveTripHalts();
        if (haltsRes?.data?.trip_id) {
          setActiveTripId(haltsRes.data.trip_id);
        } else {
          const dashRes = await DriverApiService.getDashboard();
          if (dashRes?.data?.active_trip?.trip_id) {
            setActiveTripId(dashRes.data.active_trip.trip_id);
          }
        }
      } catch (fetchErr) {
        console.log('Failed to fetch existing active trip:', fetchErr);
      }
    }
  };

  const markHaltComplete = async (haltId: string) => {
    const current = halts[currentHaltIndex];
    setHalts(prev =>
      prev.map(h => (h.id === haltId ? { ...h, completed: true } : h))
    );
    if (currentHaltIndex < halts.length - 1) {
      setCurrentHaltIndex(prev => prev + 1);
    }

    let targetTripId = activeTripId;
    if (!targetTripId) {
      try {
        const hRes = await DriverApiService.getActiveTripHalts();
        if (hRes?.data?.trip_id) {
          targetTripId = hRes.data.trip_id;
          setActiveTripId(targetTripId);
        } else {
          const dashRes = await DriverApiService.getDashboard();
          if (dashRes?.data?.active_trip?.trip_id) {
            targetTripId = dashRes.data.active_trip.trip_id;
            setActiveTripId(targetTripId);
          }
        }
      } catch (e) {
        // ignore
      }
    }

    const currentSeqNo = current ? (current.sequenceNo || currentHaltIndex + 1) : currentHaltIndex + 1;
    const currentWaiting = current ? (current.waitingCount || 0) : 0;

    console.log(`[DriverApp] Calling completeHalt: trip_id=${targetTripId}, halt_id=${haltId}, sequence_no=${currentSeqNo}`);

    if (targetTripId && haltId) {
      try {
        await DriverApiService.completeHalt({
          trip_id: targetTripId,
          halt_id: haltId,
          sequence_no: Number(currentSeqNo),
          boarded_passengers: Number(currentWaiting),
        });
      } catch (err: any) {
        console.log('Backend completeHalt error:', err.message);
      }
    } else {
      console.log('[DriverApp] Cannot complete halt on backend: missing trip_id or halt_id', { targetTripId, haltId });
    }
  };

  const reportBreakdown = async (reason: string, notes: string): Promise<{ success: boolean; message?: string }> => {
    setTripStatus('breakdown');
    try {
      const res = await DriverApiService.reportBreakdown({
        reason,
        location: halts[currentHaltIndex]?.name || 'Current Trip Location',
        notes,
        trip_id: activeTripId || undefined,
      });
      return { success: true, message: res?.message || 'Emergency breakdown alert sent successfully' };
    } catch (err: any) {
      console.log('Backend breakdown error:', err.message);
      return { success: false, message: err.message || 'Failed to report breakdown' };
    }
  };

  const finishTrip = async () => {
    setTripStatus('completed');
    if (activeTripId) {
      try {
        const res = await DriverApiService.finishTrip(activeTripId);
        refreshDashboard();
        return res?.data;
      } catch (err: any) {
        console.log('Backend finishTrip error:', err.message);
        return null;
      }
    }
    return null;
  };

  const addCostLog = async (log: Omit<CostItem, 'id'>) => {
    const newLog: CostItem = {
      ...log,
      id: `c_${Date.now()}`,
    };
    setCosts(prev => [newLog, ...prev]);
    if (log.type === 'FUEL' && typeof log.liters === 'number') {
      setFuelLoggedToday(prev => prev + (log.liters || 0));
      setTotalFuelToday(prev => prev + log.amount);
    } else {
      setTotalRepairToday(prev => prev + log.amount);
    }
    setTotalFuelMonth(prev => prev + log.amount);

    try {
      await DriverApiService.logCost({
        maintenance_type: log.type,
        amount: log.amount,
        liters: log.liters,
        description: log.stationOrDescription,
      });
      refreshCosts();
    } catch (err) {
      console.log('Backend cost log offline fallback:', err);
    }
  };

  const updateHaltName = async (haltId: string, newName: string) => {
    setHalts(prev =>
      prev.map(h => (h.id === haltId ? { ...h, name: newName } : h))
    );
    try {
      await DriverApiService.updateHalt(haltId, { name: newName });
    } catch (err) {
      console.log('Backend updateHalt offline fallback:', err);
    }
  };

  const updateProfileDetails = async (name: string, phone: string): Promise<{ success: boolean; message?: string }> => {
    setDriverName(name);
    setDriverPhone(phone);
    await saveAuthSession(true, name, phone);
    try {
      const res = await DriverApiService.updateProfile({ name, phone });
      return { success: true, message: res?.message || 'Profile updated successfully' };
    } catch (err: any) {
      return { success: true, message: 'Profile updated locally' };
    }
  };

  const uploadDocument = async (payload: { document_type: string; expires_at: string; file_url?: string; category: string }): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await DriverApiService.uploadDocument({
        document_type: payload.document_type,
        expires_at: payload.expires_at,
        file_url: payload.file_url || 'https://rapidroute.com/docs/uploaded_doc.pdf',
        category: payload.category,
      });
      await refreshDocuments();
      await refreshDashboard();
      return { success: true, message: res?.message || 'Document uploaded successfully' };
    } catch (err: any) {
      console.log('Backend uploadDocument error:', err.message);
      return { success: false, message: err.message || 'Failed to upload document' };
    }
  };

  return (
    <AppStateContext.Provider
      value={{
        isAuthenticated,
        isLoadingSession,
        isSyncing,
        driverName,
        driverPhone,
        driverEmail,
        driverLicenseNo,
        vehicleNo,
        vehicleModel,
        activeRoute,
        activeRouteName,
        passengersToday,
        fuelLoggedToday,
        activeTripId,
        tripStatus,
        tripStartTime,
        tripElapsedTime,
        tripDurationMinutes,
        currentHaltIndex,
        halts,
        documents,
        costs,
        totalFuelToday,
        totalRepairToday,
        totalFuelMonth,
        hasLocationPermission,
        setHasLocationPermission,
        login,
        signup,
        logout,
        refreshDashboard,
        refreshDocuments,
        refreshCosts,
        refreshHalts,
        startTripReview,
        confirmStartTrip,
        markHaltComplete,
        reportBreakdown,
        finishTrip,
        addCostLog,
        updateHaltName,
        updateProfileDetails,
        uploadDocument,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
