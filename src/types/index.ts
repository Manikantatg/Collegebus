export interface BusStop {
  name: string;
  scheduledTime: string;
  actualTime?: string;
  completed: boolean;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface BusLog {
  busId: number;
  driverId: string;
  driverEmail: string;
  timestamp: string;
  type: 'entry' | 'exit';
}

export interface BusData {
  id: number;
  currentStopIndex: number;
  eta: number | null;
  route: BusStop[];
  etaRequests: EtaRequest[];
  notifications: Notification[];
  lastLog?: BusLog;
  totalDistance?: number;
  routeCompleted?: boolean; // Add this property to match Firebase structure
  studentCount?: number; // Add student count property
  atStop?: boolean; // Whether the bus has arrived at the current stop
}

export interface EtaRequest {
  stopIndex: number;
  minutes: number;
  timestamp: string;
  nextStop: string;
}

export interface Notification {
  type: 'eta' | 'update' | 'request';
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