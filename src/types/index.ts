export interface BusStop {
  name: string;
  completed: boolean;
  timestamp: string | null;
}

export interface Location {
  lat: number;
  lng: number;
  timestamp: string;
  speed: number;
}

export interface BusLog {
  busId: number;
  driverId: string;
  driverEmail: string;
  timestamp: string;
  type: 'entry' | 'exit';
  location: Location;
}

export interface BusData {
  id: number;
  currentStopIndex: number;
  eta: number | null;
  route: BusStop[];
  etaRequests: EtaRequest[];
  notifications: Notification[];
  currentLocation?: Location;
  currentDriver?: {
    uid: string;
    email: string;
    name: string;
  };
  lastLog?: BusLog;
  totalDistance?: number;
}

export interface EtaRequest {
  stopIndex: number;
  minutes: number;
  timestamp: string;
  nextStop: string;
}

export interface Notification {
  type: 'eta' | 'update' | 'request' | 'geofence';
  message: string;
  timestamp: string;
}

export interface Driver {
  uid: string;
  email: string;
  name: string;
  currentBus?: number;
  lastActive?: string;
}