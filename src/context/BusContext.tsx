import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { BusData, BusStop, EtaRequest, Location } from '../types';
import { busRoutes, drivers } from '../data/busRoutes';
import { formatTime } from '../utils/geofence';

interface BusContextType {
  buses: Record<number, BusData>;
  selectedBus: number | null;
  setSelectedBus: (busId: number | null) => void;
  moveToNextStop: (busId: number) => void;
  moveToPreviousStop: (busId: number) => void;
  setEta: (busId: number, minutes: number) => void;
  resetBusProgress: (busId: number) => void;
  getFormattedTime: () => string;
  requestStop: (busId: number) => void;
  logDriverAttendance: (busId: number, type: 'entry' | 'exit', location: { lat: number; lng: number }) => Promise<void>;
  reverseRoute: () => void;
}

const BusContext = createContext<BusContextType | undefined>(undefined);

export const useBus = () => {
  const context = useContext(BusContext);
  if (!context) {
    throw new Error('useBus must be used within a BusProvider');
  }
  return context;
};

export const BusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buses, setBuses] = useState<Record<number, BusData>>({});
  const [selectedBus, setSelectedBus] = useState<number | null>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    // Don't initialize Firestore operations until auth is ready and user is logged in
    if (loading || !user) return;

    const unsubscribes = Object.keys(busRoutes).map((busId) => {
      return onSnapshot(doc(db, 'buses', busId), (doc) => {
        const data = doc.data() as BusData;
        setBuses((prev) => ({
          ...prev,
          [parseInt(busId)]: data,
        }));
      });
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [user, loading]);

  const getFormattedTime = (): string => {
    return formatTime(new Date());
  };

  const logDriverAttendance = async (busId: number, type: 'entry' | 'exit', location: { lat: number; lng: number }) => {
    const bus = buses[busId];
    if (!bus) return;

    const driver = drivers.find(d => d.bus === busId);
    if (!driver) return;

    const timestamp = new Date().toISOString();
    const formattedTime = formatTime(new Date());

    const log = {
      busId,
      driverId: driver.email,
      driverName: driver.name,
      timestamp,
      type,
      location,
    };

    const notification = {
      type: 'update',
      message: `Driver ${type === 'entry' ? 'started' : 'ended'} shift at ${formattedTime}`,
      timestamp: formattedTime,
    };

    const updatedBus = {
      ...bus,
      currentDriver: type === 'entry' ? { 
        email: driver.email,
        name: driver.name 
      } : null,
      isActive: type === 'entry',
      currentLocation: type === 'entry' ? location : null,
      lastLog: log,
      notifications: [...(bus.notifications || []), notification].slice(-10),
    };

    await updateDoc(doc(db, 'buses', busId.toString()), updatedBus);
  };

  const moveToNextStop = async (busId: number) => {
    const bus = buses[busId];
    if (!bus || bus.currentStopIndex >= bus.route.length - 1) return;

    const updatedRoute = [...bus.route];
    updatedRoute[bus.currentStopIndex] = {
      ...updatedRoute[bus.currentStopIndex],
      completed: true,
      actualTime: getFormattedTime(),
    };

    const notification = {
      type: 'update',
      message: `Bus moved to ${bus.route[bus.currentStopIndex + 1].name}`,
      timestamp: getFormattedTime(),
    };

    const updatedBus = {
      ...bus,
      currentStopIndex: bus.currentStopIndex + 1,
      eta: null,
      route: updatedRoute,
      notifications: [...(bus.notifications || []), notification].slice(-10),
    };

    await updateDoc(doc(db, 'buses', busId.toString()), updatedBus);
  };

  const moveToPreviousStop = async (busId: number) => {
    const bus = buses[busId];
    if (!bus || bus.currentStopIndex <= 0) return;

    const updatedRoute = [...bus.route];
    updatedRoute[bus.currentStopIndex - 1] = {
      ...updatedRoute[bus.currentStopIndex - 1],
      completed: false,
      actualTime: undefined,
    };

    const notification = {
      type: 'update',
      message: `Bus returned to ${bus.route[bus.currentStopIndex - 1].name}`,
      timestamp: getFormattedTime(),
    };

    const updatedBus = {
      ...bus,
      currentStopIndex: bus.currentStopIndex - 1,
      eta: null,
      route: updatedRoute,
      notifications: [...(bus.notifications || []), notification].slice(-10),
    };

    await updateDoc(doc(db, 'buses', busId.toString()), updatedBus);
  };

  const setEta = async (busId: number, minutes: number) => {
    const bus = buses[busId];
    if (!bus) return;

    const nextStopName = bus.route[bus.currentStopIndex + 1]?.name || 'next stop';

    const newEtaRequest = {
      stopIndex: bus.currentStopIndex,
      minutes,
      timestamp: getFormattedTime(),
      nextStop: nextStopName,
    };

    const notification = {
      type: 'eta',
      message: `ETA to ${nextStopName}: ${minutes} minutes`,
      timestamp: getFormattedTime(),
    };

    const updatedBus = {
      ...bus,
      eta: minutes,
      etaRequests: [...bus.etaRequests, newEtaRequest].slice(-9),
      notifications: [...(bus.notifications || []), notification].slice(-10),
    };

    await updateDoc(doc(db, 'buses', busId.toString()), updatedBus);
  };

  const requestStop = async (busId: number) => {
    const bus = buses[busId];
    if (!bus) return;

    const notification = {
      type: 'request',
      message: '5-minute stop requested by student',
      timestamp: getFormattedTime(),
    };

    const updatedBus = {
      ...bus,
      notifications: [...(bus.notifications || []), notification].slice(-10),
    };

    await updateDoc(doc(db, 'buses', busId.toString()), updatedBus);
  };

  const resetBusProgress = async (busId: number) => {
    const bus = buses[busId];
    if (!bus) return;

    const updatedBus = {
      ...bus,
      currentStopIndex: 0,
      eta: null,
      route: bus.route.map(stop => ({
        name: stop.name,
        scheduledTime: stop.scheduledTime,
        completed: false,
        actualTime: undefined,
      })),
      etaRequests: [],
      notifications: [],
    };

    await updateDoc(doc(db, 'buses', busId.toString()), updatedBus);
  };

  const reverseRoute = async () => {
    const updatedBuses = { ...buses };
    
    for (const busId in updatedBuses) {
      const bus = updatedBuses[busId];
      const reversedRoute = [...bus.route].reverse().map(stop => ({
        name: stop.name,
        completed: false,
        timestamp: null
      }));
      
      await updateDoc(doc(db, 'buses', busId), {
        ...bus,
        currentStopIndex: 0,
        route: reversedRoute
      });
    }
  };

  return (
    <BusContext.Provider
      value={{
        buses,
        selectedBus,
        setSelectedBus,
        moveToNextStop,
        moveToPreviousStop,
        setEta,
        resetBusProgress,
        getFormattedTime,
        requestStop,
        logDriverAttendance,
        reverseRoute
      }}
    >
      {children}
    </BusContext.Provider>
  );
};