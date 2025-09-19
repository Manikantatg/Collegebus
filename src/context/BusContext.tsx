import React, { createContext, useContext, useState, useEffect } from 'react';
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

// Initialize hardcoded bus data
const initializeHardcodedBuses = (): Record<number, BusData> => {
  const buses: Record<number, BusData> = {};
  
  Object.keys(busRoutes).forEach((busIdStr) => {
    const busId = parseInt(busIdStr);
    buses[busId] = {
      id: busId,
      currentStopIndex: 0,
      eta: null,
      route: busRoutes[busId].map(stop => ({
        name: stop.name,
        scheduledTime: stop.scheduledTime,
        completed: false,
        actualTime: undefined
      })),
      etaRequests: [],
      notifications: [],
      currentLocation: null,
      currentDriver: null,
      lastLog: null,
      totalDistance: 0
    };
  });
  
  return buses;
};

export const BusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buses, setBuses] = useState<Record<number, BusData>>(() => initializeHardcodedBuses());
  const [selectedBus, setSelectedBus] = useState<number | null>(null);

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
      driverEmail: driver.email,
      timestamp,
      type,
      location: {
        lat: location.lat,
        lng: location.lng,
        timestamp,
        speed: 0
      }
    };

    const notification = {
      type: 'update' as const,
      message: `Driver ${type === 'entry' ? 'started' : 'ended'} shift at ${formattedTime}`,
      timestamp: formattedTime,
    };

    setBuses(prev => ({
      ...prev,
      [busId]: {
        ...bus,
        currentDriver: type === 'entry' ? { 
          uid: driver.email,
          email: driver.email,
          name: driver.name 
        } : null,
        currentLocation: type === 'entry' ? {
          lat: location.lat,
          lng: location.lng,
          timestamp,
          speed: 0
        } : null,
        lastLog: log,
        notifications: [...(bus.notifications || []), notification].slice(-10),
      }
    }));
  };

  const moveToNextStop = (busId: number) => {
    const bus = buses[busId];
    if (!bus || bus.currentStopIndex >= bus.route.length - 1) return;

    const updatedRoute = [...bus.route];
    updatedRoute[bus.currentStopIndex] = {
      ...updatedRoute[bus.currentStopIndex],
      completed: true,
      actualTime: getFormattedTime(),
    };

    const notification = {
      type: 'update' as const,
      message: `Bus arrived at ${bus.route[bus.currentStopIndex].name}`,
      timestamp: getFormattedTime(),
    };

    setBuses(prev => ({
      ...prev,
      [busId]: {
        ...bus,
        currentStopIndex: bus.currentStopIndex + 1,
        eta: null,
        route: updatedRoute,
        notifications: [...(bus.notifications || []), notification].slice(-10),
      }
    }));
  };

  const moveToPreviousStop = (busId: number) => {
    const bus = buses[busId];
    if (!bus || bus.currentStopIndex <= 0) return;

    const updatedRoute = [...bus.route];
    updatedRoute[bus.currentStopIndex - 1] = {
      ...updatedRoute[bus.currentStopIndex - 1],
      completed: false,
      actualTime: undefined,
    };

    const notification = {
      type: 'update' as const,
      message: `Bus returned to ${bus.route[bus.currentStopIndex - 1].name}`,
      timestamp: getFormattedTime(),
    };

    setBuses(prev => ({
      ...prev,
      [busId]: {
        ...bus,
        currentStopIndex: bus.currentStopIndex - 1,
        eta: null,
        route: updatedRoute,
        notifications: [...(bus.notifications || []), notification].slice(-10),
      }
    }));
  };

  const setEta = (busId: number, minutes: number) => {
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
      type: 'eta' as const,
      message: `ETA to ${nextStopName}: ${minutes} minutes`,
      timestamp: getFormattedTime(),
    };

    setBuses(prev => ({
      ...prev,
      [busId]: {
        ...bus,
        eta: minutes,
        etaRequests: [...bus.etaRequests, newEtaRequest].slice(-9),
        notifications: [...(bus.notifications || []), notification].slice(-10),
      }
    }));
  };

  const requestStop = (busId: number) => {
    const bus = buses[busId];
    if (!bus) return;

    const notification = {
      type: 'request' as const,
      message: '5-minute stop requested by student',
      timestamp: getFormattedTime(),
    };

    setBuses(prev => ({
      ...prev,
      [busId]: {
        ...bus,
        notifications: [...(bus.notifications || []), notification].slice(-10),
      }
    }));
  };

  const resetBusProgress = (busId: number) => {
    const bus = buses[busId];
    if (!bus) return;

    setBuses(prev => ({
      ...prev,
      [busId]: {
        ...bus,
        currentStopIndex: 0,
        eta: null,
        route: busRoutes[busId].map(stop => ({
          name: stop.name,
          scheduledTime: stop.scheduledTime,
          completed: false,
          actualTime: undefined,
        })),
        etaRequests: [],
        notifications: [],
      }
    }));
  };

  const reverseRoute = () => {
    setBuses(prev => {
      const updatedBuses = { ...prev };
      
      for (const busId in updatedBuses) {
        const bus = updatedBuses[busId];
        const reversedRoute = [...bus.route].reverse().map(stop => ({
          name: stop.name,
          scheduledTime: stop.scheduledTime,
          completed: false,
          actualTime: undefined
        }));
        
        updatedBuses[busId] = {
          ...bus,
          currentStopIndex: 0,
          route: reversedRoute
        };
      }
      
      return updatedBuses;
    });
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