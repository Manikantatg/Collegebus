export interface BusStop {
  name: string;
  scheduledTime: string;
  actualTime?: string;
  completed: boolean;
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