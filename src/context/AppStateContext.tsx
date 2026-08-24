import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export interface FuelLogItem {
  id: string;
  date: string;
  amount: number; // LKR
  liters: number; // L
  station: string;
}

export interface HaltItem {
  id: string;
  name: string;
  scheduledTime: string;
  passengersWaiting: number;
  passengersAlighting: number;
  completed: boolean;
}

interface AppStateContextType {
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  driverName: string;
  driverPhone: string;
  vehicleNo: string;
  activeRoute: string;
  activeRouteName: string;
  passengersToday: number;
  fuelLoggedToday: number;
  tripStatus: 'idle' | 'halts_review' | 'active' | 'breakdown';
  tripElapsedTime: string;
  currentHaltIndex: number;
  halts: HaltItem[];
  documents: DocumentItem[];
  costs: CostItem[];
  totalFuelToday: number;
  totalRepairToday: number;
  totalFuelMonth: number;
  hasLocationPermission: boolean;
  setHasLocationPermission: (val: boolean) => void;
  login: () => void;
  signup: (details: any) => void;
  logout: () => void;
  startTripReview: () => void;
  confirmStartTrip: () => void;
  markHaltComplete: (haltId: string) => void;
  reportBreakdown: (reason: string, notes: string) => void;
  addCostLog: (log: Omit<CostItem, 'id'>) => void;
  updateHaltName: (haltId: string, newName: string) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);
const AUTH_STORAGE_KEY = '@smartbus_driver_auth';

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const [driverName, setDriverName] = useState('Kusum Perera');
  const [driverPhone, setDriverPhone] = useState('+94 77 123 4567');
  const [vehicleNo, setVehicleNo] = useState('NB-4592 (AC Bus)');
  const [activeRoute, setActiveRoute] = useState('Route 138');
  const [activeRouteName, setActiveRouteName] = useState('Colombo (Pettah) to Kottawa');
  const [passengersToday, setPassengersToday] = useState(142);
  const [fuelLoggedToday, setFuelLoggedToday] = useState(45);
  
  const [tripStatus, setTripStatus] = useState<'idle' | 'halts_review' | 'active' | 'breakdown'>('idle');
  const [tripElapsedTime, setTripElapsedTime] = useState('00:42:15');
  const [currentHaltIndex, setCurrentHaltIndex] = useState(3); // e.g. Rajagiriya

  const [halts, setHalts] = useState<HaltItem[]>([
    { id: 'h1', name: 'Colombo (Pettah)', scheduledTime: '06:00 AM', passengersWaiting: 12, passengersAlighting: 0, completed: true },
    { id: 'h2', name: 'Maradana Junction', scheduledTime: '06:12 AM', passengersWaiting: 8, passengersAlighting: 4, completed: true },
    { id: 'h3', name: 'Borella Supermarket', scheduledTime: '06:24 AM', passengersWaiting: 15, passengersAlighting: 6, completed: true },
    { id: 'h4', name: 'Rajagiriya Flyover', scheduledTime: '06:38 AM', passengersWaiting: 5, passengersAlighting: 3, completed: false },
    { id: 'h5', name: 'Battaramulla Depot', scheduledTime: '06:50 AM', passengersWaiting: 10, passengersAlighting: 2, completed: false },
    { id: 'h6', name: 'Pelawatte Crossroad', scheduledTime: '07:05 AM', passengersWaiting: 6, passengersAlighting: 5, completed: false },
    { id: 'h7', name: 'Pannipitiya Station', scheduledTime: '07:22 AM', passengersWaiting: 14, passengersAlighting: 8, completed: false },
    { id: 'h8', name: 'Kottawa Bus Stand', scheduledTime: '07:35 AM', passengersWaiting: 0, passengersAlighting: 25, completed: false },
  ]);

  const [documents, setDocuments] = useState<DocumentItem[]>([
    { id: 'd1', name: 'Driving Licence', category: 'driver', status: 'valid', expiryDate: '2028-11-15' },
    { id: 'd2', name: 'Revenue Licence', category: 'vehicle', status: 'warning', expiryDate: '2026-09-12', daysRemaining: 18 },
    { id: 'd3', name: 'Vehicle Insurance', category: 'vehicle', status: 'valid', expiryDate: '2027-01-20' },
    { id: 'd4', name: 'Emission Test Report', category: 'vehicle', status: 'expired', expiryDate: '2026-08-10' },
    { id: 'd5', name: 'AC Fitness Certificate', category: 'vehicle', status: 'warning', expiryDate: '2026-09-18', daysRemaining: 24 },
  ]);

  const [costs, setCosts] = useState<CostItem[]>([
    { id: 'c1', type: 'FUEL', date: 'May 25, 2026', amount: 9450, liters: 45, stationOrDescription: 'Pettah Fuel Station' },
    { id: 'c2', type: 'FUEL', date: 'May 24, 2026', amount: 8820, liters: 42, stationOrDescription: 'Kottawa Fuel Station' },
    { id: 'c3', type: 'REPAIR', date: 'May 22, 2026', amount: 3500, stationOrDescription: 'Headlight Bulb & Fuse Replacement' },
    { id: 'c4', type: 'FUEL', date: 'May 21, 2026', amount: 10080, liters: 48, stationOrDescription: 'Malabe Fuel Station' },
  ]);

  const totalFuelToday = 9450;
  const totalRepairToday = 0;
  const totalFuelMonth = 285600;

  // Restore saved login session on startup
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.isAuthenticated) {
            setIsAuthenticated(true);
            if (parsed.driverName) setDriverName(parsed.driverName);
            if (parsed.driverPhone) setDriverPhone(parsed.driverPhone);
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setIsLoadingSession(false);
      }
    };
    restoreSession();
  }, []);

  const saveAuthSession = async (auth: boolean, name?: string, phoneStr?: string) => {
    try {
      const payload = {
        isAuthenticated: auth,
        driverName: name || driverName,
        driverPhone: phoneStr || driverPhone,
      };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error('Failed to save auth session:', err);
    }
  };

  const login = () => {
    setIsAuthenticated(true);
    saveAuthSession(true);
  };

  const signup = (details: any) => {
    const name = details.fullName || driverName;
    const phoneStr = details.phone || driverPhone;
    if (details.fullName) setDriverName(details.fullName);
    if (details.phone) setDriverPhone(details.phone);
    setIsAuthenticated(true);
    saveAuthSession(true, name, phoneStr);
  };

  const logout = () => {
    setIsAuthenticated(false);
    AsyncStorage.removeItem(AUTH_STORAGE_KEY).catch(console.error);
  };

  const startTripReview = () => {
    setTripStatus('halts_review');
  };

  const confirmStartTrip = () => {
    setTripStatus('active');
  };

  const markHaltComplete = (haltId: string) => {
    setHalts(prev =>
      prev.map(h => (h.id === haltId ? { ...h, completed: true } : h))
    );
    if (currentHaltIndex < halts.length - 1) {
      setCurrentHaltIndex(prev => prev + 1);
    }
  };

  const reportBreakdown = (reason: string, notes: string) => {
    setTripStatus('breakdown');
  };

  const addCostLog = (log: Omit<CostItem, 'id'>) => {
    const newLog: CostItem = {
      ...log,
      id: `c_${Date.now()}`,
    };
    setCosts(prev => [newLog, ...prev]);
    if (log.type === 'FUEL' && typeof log.liters === 'number') {
      setFuelLoggedToday(prev => prev + (log.liters || 0));
    }
  };

  const updateHaltName = (haltId: string, newName: string) => {
    setHalts(prev =>
      prev.map(h => (h.id === haltId ? { ...h, name: newName } : h))
    );
  };

  return (
    <AppStateContext.Provider
      value={{
        isAuthenticated,
        isLoadingSession,
        driverName,
        driverPhone,
        vehicleNo,
        activeRoute,
        activeRouteName,
        passengersToday,
        fuelLoggedToday,
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
        startTripReview,
        confirmStartTrip,
        markHaltComplete,
        reportBreakdown,
        addCostLog,
        updateHaltName,
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
