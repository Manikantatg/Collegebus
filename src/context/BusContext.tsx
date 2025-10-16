import React, { createContext, useContext, useState, useEffect } from 'react';
import { BusData, BusStop, EtaRequest } from '../types';
import { busRoutes, drivers } from '../data/busRoutes';
import { formatTime } from '../utils/geofence';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

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
  loading: boolean;
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
  const [loading, setLoading] = useState(true);

  const loadBusData = async () => {
    try {
      const { data: busesData, error: busesError } = await supabase
        .from('buses')
        .select('*');

      if (busesError) throw busesError;

      const { data: stopsData, error: stopsError } = await supabase
        .from('bus_stops')
        .select('*')
        .order('stop_index', { ascending: true });

      if (stopsError) throw stopsError;

      const { data: etaData, error: etaError } = await supabase
        .from('eta_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (etaError) throw etaError;

      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (notificationsError) throw notificationsError;

      const busesMap: Record<number, BusData> = {};

      if (busesData) {
        for (const bus of busesData) {
          const stops = stopsData?.filter(s => s.bus_id === bus.id) || [];
          const etaRequests = etaData?.filter(e => e.bus_id === bus.id).slice(0, 9) || [];
          const notifications = notificationsData?.filter(n => n.bus_id === bus.id).slice(0, 10) || [];

          busesMap[bus.id] = {
            id: bus.id,
            currentStopIndex: bus.current_stop_index,
            eta: bus.eta,
            route: stops.map(s => ({
              name: s.name,
              scheduledTime: s.scheduled_time,
              completed: s.completed,
              actualTime: s.actual_time || undefined
            })),
            etaRequests: etaRequests.map(e => ({
              stopIndex: e.stop_index,
              minutes: e.minutes,
              timestamp: e.timestamp,
              nextStop: e.next_stop
            })),
            notifications: notifications.map(n => ({
              type: n.type as 'update' | 'eta' | 'request',
              message: n.message,
              timestamp: n.timestamp
            })),
            currentLocation: bus.current_location_lat && bus.current_location_lng ? {
              lat: bus.current_location_lat,
              lng: bus.current_location_lng,
              timestamp: bus.current_location_timestamp,
              speed: bus.current_location_speed || 0
            } : null,
            currentDriver: bus.current_driver_email ? {
              uid: bus.current_driver_email,
              email: bus.current_driver_email,
              name: bus.current_driver_name || ''
            } : null,
            lastLog: null,
            totalDistance: bus.total_distance
          };
        }
      }

      setBuses(busesMap);
      setLoading(false);
    } catch (error) {
      console.error('Error loading bus data:', error);
      toast.error('Failed to load bus data');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusData();

    const busChannel = supabase
      .channel('buses_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'buses' }, () => {
        loadBusData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bus_stops' }, () => {
        loadBusData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eta_requests' }, () => {
        loadBusData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        loadBusData();
      })
      .subscribe();

    return () => {
      busChannel.unsubscribe();
    };
  }, []);

  const getFormattedTime = (): string => {
    return formatTime(new Date());
  };

  const logDriverAttendance = async (busId: number, type: 'entry' | 'exit', location: { lat: number; lng: number }) => {
    try {
      const driver = drivers.find(d => d.bus === busId);
      if (!driver) return;

      const timestamp = new Date().toISOString();
      const formattedTime = formatTime(new Date());

      await supabase.from('driver_logs').insert({
        bus_id: busId,
        driver_email: driver.email,
        driver_name: driver.name,
        type,
        location_lat: location.lat,
        location_lng: location.lng,
        location_speed: 0,
        location_timestamp: timestamp
      });

      const updateData: any = {
        last_updated: timestamp
      };

      if (type === 'entry') {
        updateData.current_driver_email = driver.email;
        updateData.current_driver_name = driver.name;
        updateData.current_location_lat = location.lat;
        updateData.current_location_lng = location.lng;
        updateData.current_location_timestamp = timestamp;
        updateData.current_location_speed = 0;
      } else {
        updateData.current_driver_email = null;
        updateData.current_driver_name = null;
        updateData.current_location_lat = null;
        updateData.current_location_lng = null;
        updateData.current_location_timestamp = null;
        updateData.current_location_speed = null;
      }

      await supabase
        .from('buses')
        .update(updateData)
        .eq('id', busId);

      await supabase.from('notifications').insert({
        bus_id: busId,
        type: 'update',
        message: `Driver ${type === 'entry' ? 'started' : 'ended'} shift at ${formattedTime}`,
        timestamp: formattedTime
      });
    } catch (error) {
      console.error('Error logging driver attendance:', error);
      toast.error('Failed to log attendance');
    }
  };

  const moveToNextStop = async (busId: number) => {
    try {
      const bus = buses[busId];
      if (!bus || bus.currentStopIndex >= bus.route.length - 1) return;

      const currentStop = bus.route[bus.currentStopIndex];
      const formattedTime = getFormattedTime();

      await supabase
        .from('bus_stops')
        .update({
          completed: true,
          actual_time: formattedTime
        })
        .eq('bus_id', busId)
        .eq('stop_index', bus.currentStopIndex);

      await supabase
        .from('buses')
        .update({
          current_stop_index: bus.currentStopIndex + 1,
          eta: null,
          last_updated: new Date().toISOString()
        })
        .eq('id', busId);

      await supabase.from('notifications').insert({
        bus_id: busId,
        type: 'update',
        message: `Bus arrived at ${currentStop.name}`,
        timestamp: formattedTime
      });
    } catch (error) {
      console.error('Error moving to next stop:', error);
      toast.error('Failed to update stop');
    }
  };

  const moveToPreviousStop = async (busId: number) => {
    try {
      const bus = buses[busId];
      if (!bus || bus.currentStopIndex <= 0) return;

      const previousStopIndex = bus.currentStopIndex - 1;
      const previousStop = bus.route[previousStopIndex];
      const formattedTime = getFormattedTime();

      await supabase
        .from('bus_stops')
        .update({
          completed: false,
          actual_time: null
        })
        .eq('bus_id', busId)
        .eq('stop_index', previousStopIndex);

      await supabase
        .from('buses')
        .update({
          current_stop_index: previousStopIndex,
          eta: null,
          last_updated: new Date().toISOString()
        })
        .eq('id', busId);

      await supabase.from('notifications').insert({
        bus_id: busId,
        type: 'update',
        message: `Bus returned to ${previousStop.name}`,
        timestamp: formattedTime
      });
    } catch (error) {
      console.error('Error moving to previous stop:', error);
      toast.error('Failed to update stop');
    }
  };

  const setEta = async (busId: number, minutes: number) => {
    try {
      const bus = buses[busId];
      if (!bus) return;

      const nextStopName = bus.route[bus.currentStopIndex + 1]?.name || 'next stop';
      const formattedTime = getFormattedTime();

      await supabase
        .from('buses')
        .update({
          eta: minutes,
          last_updated: new Date().toISOString()
        })
        .eq('id', busId);

      await supabase.from('eta_requests').insert({
        bus_id: busId,
        stop_index: bus.currentStopIndex,
        minutes,
        next_stop: nextStopName,
        timestamp: formattedTime
      });

      await supabase.from('notifications').insert({
        bus_id: busId,
        type: 'eta',
        message: `ETA to ${nextStopName}: ${minutes} minutes`,
        timestamp: formattedTime
      });
    } catch (error) {
      console.error('Error setting ETA:', error);
      toast.error('Failed to set ETA');
    }
  };

  const requestStop = async (busId: number) => {
    try {
      const formattedTime = getFormattedTime();

      await supabase.from('notifications').insert({
        bus_id: busId,
        type: 'request',
        message: '5-minute stop requested by student',
        timestamp: formattedTime
      });

      toast.success('Stop request sent to driver');
    } catch (error) {
      console.error('Error requesting stop:', error);
      toast.error('Failed to request stop');
    }
  };

  const resetBusProgress = async (busId: number) => {
    try {
      await supabase
        .from('buses')
        .update({
          current_stop_index: 0,
          eta: null,
          last_updated: new Date().toISOString()
        })
        .eq('id', busId);

      await supabase
        .from('bus_stops')
        .update({
          completed: false,
          actual_time: null
        })
        .eq('bus_id', busId);

      await supabase
        .from('notifications')
        .delete()
        .eq('bus_id', busId);

      await supabase
        .from('eta_requests')
        .delete()
        .eq('bus_id', busId);

      toast.success('Route reset successfully');
    } catch (error) {
      console.error('Error resetting bus progress:', error);
      toast.error('Failed to reset route');
    }
  };

  const reverseRoute = async () => {
    try {
      for (const busId of Object.keys(buses)) {
        const bus = buses[parseInt(busId)];
        const reversedRoute = [...bus.route].reverse();

        await supabase
          .from('bus_stops')
          .delete()
          .eq('bus_id', parseInt(busId));

        const stops = reversedRoute.map((stop, index) => ({
          bus_id: parseInt(busId),
          stop_index: index,
          name: stop.name,
          scheduled_time: stop.scheduledTime,
          completed: false,
          actual_time: null
        }));

        await supabase
          .from('bus_stops')
          .insert(stops);

        await supabase
          .from('buses')
          .update({
            current_stop_index: 0,
            last_updated: new Date().toISOString()
          })
          .eq('id', parseInt(busId));
      }

      toast.success('All routes reversed');
    } catch (error) {
      console.error('Error reversing routes:', error);
      toast.error('Failed to reverse routes');
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
        reverseRoute,
        loading
      }}
    >
      {children}
    </BusContext.Provider>
  );
};
