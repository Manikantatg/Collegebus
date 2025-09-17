import { Location } from '../types';

export function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371e3;
  const φ1 = loc1.lat * Math.PI/180;
  const φ2 = loc2.lat * Math.PI/180;
  const Δφ = (loc2.lat - loc1.lat) * Math.PI/180;
  const Δλ = (loc2.lng - loc1.lng) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
}