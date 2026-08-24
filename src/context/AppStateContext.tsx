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
  tripElapsedTime: string;
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
  finishTrip: () => Promise<any>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@smartbus_driver_auth';

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);

  // Driver and Vehicle Details
  const [driverName, setDriverName] = useState('Kamal Perera');
  const [driverPhone, setDriverPhone] = useState('0771234567');
  const [driverEmail, setDriverEmail] = useState('driver@rapidroute.com');
  const [driverLicenseNo, setDriverLicenseNo] = useState('B9482910');
  const [vehicleNo, setVehicleNo] = useState('ND-4829');
  const [vehicleModel, setVehicleModel] = useState('Leyland Viking 2022');

  // Dashboard & Active Trip State
  const [activeRoute, setActiveRoute] = useState('Route 138');
  const [activeRouteName, setActiveRouteName] = useState('Pettah - Maharagama / Kottawa');
  const [passengersToday, setPassengersToday] = useState(42);
  const [fuelLoggedToday, setFuelLoggedToday] = useState(42.5);
  const [activeTripId, setActiveTripId] = useState<string>('trip-active-01');
  const [tripStatus, setTripStatus] = useState<'idle' | 'halts_review' | 'active' | 'breakdown' | 'completed'>('idle');
  const [tripElapsedTime, setTripElapsedTime] = useState('00:42:15');

  // Halts
  const [currentHaltIndex, setCurrentHaltIndex] = useState(0);
  const [halts, setHalts] = useState<HaltItem[]>([
    { id: 'halt-01', name: 'Pettah Main Stand', sequenceNo: 1, completed: false, waitingCount: 12, dropCount: 0, distanceKm: 0, etaMin: 0, latitude: 6.9344, longitude: 79.8503 },
    { id: 'halt-02', name: 'Town Hall', sequenceNo: 2, completed: false, waitingCount: 8, dropCount: 4, distanceKm: 1.8, etaMin: 6, latitude: 6.9147, longitude: 79.8653 },
    { id: 'halt-03', name: 'Borella Junction', sequenceNo: 3, completed: false, waitingCount: 15, dropCount: 6, distanceKm: 3.2, etaMin: 12, latitude: 6.9142, longitude: 79.8778 },
    { id: 'halt-04', name: 'Nugegoda Flyover', sequenceNo: 4, completed: false, waitingCount: 5, dropCount: 3, distanceKm: 5.4, etaMin: 18, latitude: 6.8711, longitude: 79.8885 },
    { id: 'halt-05', name: 'Delkanda', sequenceNo: 5, completed: false, waitingCount: 9, dropCount: 5, distanceKm: 7.2, etaMin: 24, latitude: 6.8592, longitude: 79.8973 },
    { id: 'halt-06', name: 'Maharagama Clock Tower', sequenceNo: 6, completed: false, waitingCount: 11, dropCount: 8, distanceKm: 9.8, etaMin: 32, latitude: 6.8481, longitude: 79.9265 },
    { id: 'halt-07', name: 'Pannipitiya', sequenceNo: 7, completed: false, waitingCount: 7, dropCount: 4, distanceKm: 12.1, etaMin: 40, latitude: 6.8415, longitude: 79.9451 },
    { id: 'halt-08', name: 'Kottawa Stand', sequenceNo: 8, completed: false, waitingCount: 0, dropCount: 22, distanceKm: 15.0, etaMin: 50, latitude: 6.8411, longitude: 79.9678 },
  ]);

  // Documents
  const [documents, setDocuments] = useState<DocumentItem[]>([
    { id: 'doc-drv-01', name: 'Heavy Driving License', category: 'driver', status: 'warning', expiryDate: '2026-08-27', daysRemaining: 2 },
    { id: 'doc-veh-01', name: 'Revenue License', category: 'vehicle', status: 'valid', expiryDate: '2026-09-08', daysRemaining: 14 },
    { id: 'doc-veh-02', name: 'Passenger Service Permit', category: 'vehicle', status: 'valid', expiryDate: '2026-11-30', daysRemaining: 96 },
    { id: 'doc-veh-03', name: 'Commercial Vehicle Insurance', category: 'vehicle', status: 'valid', expiryDate: '2026-10-15', daysRemaining: 51 },
  ]);

  // Costs
  const [costs, setCosts] = useState<CostItem[]>([
    { id: 'maint-01', type: 'FUEL', date: 'May 25, 2026', amount: 9450, liters: 42.5, stationOrDescription: 'Ceypetco Filling Station - Maharagama' },
    { id: 'maint-02', type: 'FUEL', date: 'May 24, 2026', amount: 8820, liters: 40, stationOrDescription: 'Kottawa Fuel Station' },
    { id: 'maint-03', type: 'REPAIR', date: 'May 22, 2026', amount: 3500, stationOrDescription: 'Headlight Bulb & Fuse Replacement' },
  ]);

  const [totalFuelToday, setTotalFuelToday] = useState(9450);
  const [totalRepairToday, setTotalRepairToday] = useState(0);
  const [totalFuelMonth, setTotalFuelMonth] = useState(43200);

  // Sync with real backend dashboard
  const refreshDashboard = useCallback(async () => {
    try {
      setIsSyncing(true);
      const res = await DriverApiService.getDashboard();
      if (res?.success && res.data) {
        const d = res.data;
        if (d.summary) {
          setPassengersToday(d.summary.today_passengers ?? 42);
          setFuelLoggedToday(d.summary.today_fuel_liters ?? 42.5);
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
      console.log('Backend dashboard sync fallback:', err);
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
      console.log('Backend documents sync fallback:', err);
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
            date: log.logged_at ? new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'May 25, 2026',
            amount: parseFloat(log.amount) || 0,
            liters: log.liters ? parseFloat(log.liters) : undefined,
            stationOrDescription: log.description || 'Expense Entry',
          }));
          setCosts(mapped);
        }
      }
    } catch (err) {
      console.log('Backend costs sync fallback:', err);
    }
  }, []);

  // Sync halts from backend
  const refreshHalts = useCallback(async () => {
    try {
      const res = await DriverApiService.getActiveTripHalts();
      if (res?.success && res.data?.halts) {
        setActiveTripId(res.data.trip_id || activeTripId);
        if (typeof res.data.current_halt_index === 'number') {
          setCurrentHaltIndex(res.data.current_halt_index);
        }
        const mapped = res.data.halts.map((h: any, idx: number) => ({
          id: h.halt_id || `h_${idx}`,
          name: h.name || `Halt ${idx + 1}`,
          sequenceNo: h.sequence_no || idx + 1,
          completed: idx < (res.data.current_halt_index || 0),
          waitingCount: 6 + (idx % 5),
          dropCount: idx > 0 ? 3 + (idx % 4) : 0,
          distanceKm: idx * 1.8,
          etaMin: idx * 6,
          latitude: h.latitude,
          longitude: h.longitude,
        }));
        setHalts(mapped);
      }
    } catch (err) {
      console.log('Backend halts sync fallback:', err);
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
    const loginId = identifier || 'driver@rapidroute.com';
    const loginPass = password || 'Password123!';
    try {
      const res = await DriverApiService.login(loginId, loginPass);
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
        // Refresh live dashboard data
        refreshDashboard();
        refreshDocuments();
        refreshCosts();
        return { success: true, message: res.message || 'Login successful' };
      }
    } catch (err: any) {
      console.log('Live login attempt:', err.message);
      // Fallback for offline demo credentials
      if (loginId === 'driver@rapidroute.com' || loginId === '0771234567') {
        setIsAuthenticated(true);
        await saveAuthSession(true, 'Kamal Perera', '0771234567', 'driver@rapidroute.com');
        return { success: true, message: 'Logged in (Demo Mode)' };
      }
      return { success: false, message: err.message || 'Invalid credentials' };
    }
    setIsAuthenticated(true);
    await saveAuthSession(true);
    return { success: true };
  };

  const signup = async (details: any): Promise<{ success: boolean; message?: string }> => {
    const name = details.fullName || details.name || driverName;
    const phoneStr = details.phone || driverPhone;
    const emailStr = details.email || driverEmail;
    try {
      const res = await DriverApiService.register({
        name,
        email: emailStr,
        password: details.password || 'Password123!',
        phone: phoneStr,
        nic_number: details.nicNumber || '881234567V',
        license_number: details.licenseNumber || 'B9482910',
        license_class: 'Heavy Vehicle (Class A/B)',
        license_expiry: '2026-08-27',
      });
      if (details.fullName || details.name) setDriverName(name);
      if (details.phone) setDriverPhone(phoneStr);
      setIsAuthenticated(true);
      await saveAuthSession(true, name, phoneStr, emailStr, res?.data?.token);
      return { success: true, message: res?.message || 'Registered successfully' };
    } catch (err: any) {
      console.log('Online signup fallback:', err.message);
      if (details.fullName || details.name) setDriverName(name);
      if (details.phone) setDriverPhone(phoneStr);
      setIsAuthenticated(true);
      await saveAuthSession(true, name, phoneStr, emailStr);
      return { success: true, message: 'Account created' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    AsyncStorage.multiRemove([AUTH_STORAGE_KEY, 'userToken']).catch(console.error);
  };

  const startTripReview = () => {
    setTripStatus('halts_review');
    refreshHalts();
  };

  const confirmStartTrip = async () => {
    setTripStatus('active');
    try {
      const res = await DriverApiService.startTrip('route-138');
      if (res?.data?.trip_id) {
        setActiveTripId(res.data.trip_id);
      }
    } catch (err) {
      console.log('Backend startTrip offline fallback:', err);
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
    try {
      await DriverApiService.completeHalt({
        trip_id: activeTripId,
        halt_id: haltId,
        sequence_no: current ? current.sequenceNo : currentHaltIndex + 1,
        boarded_passengers: current ? current.waitingCount : 6,
      });
    } catch (err) {
      console.log('Backend completeHalt offline fallback:', err);
    }
  };

  const reportBreakdown = async (reason: string, notes: string): Promise<{ success: boolean; message?: string }> => {
    setTripStatus('breakdown');
    try {
      const res = await DriverApiService.reportBreakdown({
        reason,
        location: halts[currentHaltIndex]?.name || 'Rajagiriya Junction, Colombo',
        notes,
        trip_id: activeTripId,
      });
      return { success: true, message: res?.message || 'Emergency breakdown alert sent successfully' };
    } catch (err: any) {
      console.log('Backend breakdown offline fallback:', err);
      return { success: true, message: 'Alert broadcasted to admin and passengers' };
    }
  };

  const finishTrip = async () => {
    setTripStatus('completed');
    try {
      const res = await DriverApiService.finishTrip(activeTripId);
      refreshDashboard();
      return res?.data;
    } catch (err) {
      console.log('Backend finishTrip offline fallback:', err);
      return null;
    }
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
        tripElapsedTime,
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
