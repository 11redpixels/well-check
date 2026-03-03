// Proximity Calculation Utilities
// Haversine formula for accurate distance calculation

import { supabase, DEMO_MODE } from './supabase';
import type { Location, DistanceZone } from '../types';

// =====================================================================
// CLIENT-SIDE HAVERSINE (Fallback for offline/demo mode)
// =====================================================================

/**
 * Calculate distance between two lat/lng points using Haversine formula
 * @param lat1 - Latitude of point 1 (degrees)
 * @param lon1 - Longitude of point 1 (degrees)
 * @param lat2 - Latitude of point 2 (degrees)
 * @param lon2 - Longitude of point 2 (degrees)
 * @returns Distance in miles (2 decimal places)
 */
export function calculateDistanceClientSide(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const EARTH_RADIUS_MILES = 3958.8;

  // Convert degrees to radians
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_MILES * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

// =====================================================================
// DATABASE-SIDE CALCULATION (Production with Supabase)
// =====================================================================

/**
 * Calculate distance using Supabase RPC (server-side Haversine)
 * Falls back to client-side calculation if Supabase unavailable
 */
export async function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<number> {
  // Demo mode or offline: Use client-side calculation
  if (DEMO_MODE || !supabase) {
    return calculateDistanceClientSide(lat1, lon1, lat2, lon2);
  }

  try {
    const { data, error } = await supabase.rpc('calculate_proximity_distance', {
      lat1,
      lon1,
      lat2,
      lon2,
    });

    if (error) throw error;

    return data || 0;
  } catch (error) {
    console.warn('Supabase RPC failed, using client-side calculation:', error);
    return calculateDistanceClientSide(lat1, lon1, lat2, lon2);
  }
}

// =====================================================================
// DISTANCE ZONE HELPERS
// =====================================================================

/**
 * Convert distance in miles to color-coded zone
 * @param miles - Distance in miles
 * @returns Zone: 'nearby' | 'moderate' | 'far'
 */
export function getDistanceZone(miles: number): DistanceZone {
  if (miles < 1) return 'nearby';
  if (miles <= 5) return 'moderate';
  return 'far';
}

/**
 * Get color for distance zone (for UI styling)
 */
export function getZoneColor(zone: DistanceZone): string {
  switch (zone) {
    case 'nearby':
      return '#00FF00'; // Safety Green
    case 'moderate':
      return '#FBBF24'; // Amber
    case 'far':
      return '#FF6B6B'; // Emergency Red
  }
}

/**
 * Get label for distance zone
 */
export function getZoneLabel(zone: DistanceZone): string {
  switch (zone) {
    case 'nearby':
      return 'NEARBY';
    case 'moderate':
      return 'MODERATE';
    case 'far':
      return 'FAR';
  }
}

// =====================================================================
// LOCATION HELPERS
// =====================================================================

/**
 * Calculate proximity between two Location objects
 */
export async function calculateProximity(
  fromLocation: Location,
  toLocation: Location
): Promise<{ distance: number; zone: DistanceZone }> {
  const distance = await calculateDistance(
    fromLocation.lat,
    fromLocation.lng,
    toLocation.lat,
    toLocation.lng
  );

  const zone = getDistanceZone(distance);

  return { distance, zone };
}

/**
 * Format distance for display
 * @param miles - Distance in miles
 * @returns Formatted string (e.g., "2.3 mi")
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) return '<0.1 mi';
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

// =====================================================================
// VALIDATION
// =====================================================================

/**
 * Check if location coordinates are valid
 */
export function isValidLocation(location: Location | null | undefined): boolean {
  if (!location) return false;

  const { lat, lng } = location;

  // Check if coordinates are within valid ranges
  const isLatValid = lat >= -90 && lat <= 90;
  const isLngValid = lng >= -180 && lng <= 180;

  return isLatValid && isLngValid && lat !== 0 && lng !== 0;
}

/**
 * Get mock location for demo mode
 * Returns random location within ~5 miles of San Francisco
 */
export function getMockLocation(): Location {
  const baseLat = 37.7749; // San Francisco
  const baseLng = -122.4194;

  // Random offset: ±0.05 degrees (~3-5 miles)
  const latOffset = (Math.random() - 0.5) * 0.1;
  const lngOffset = (Math.random() - 0.5) * 0.1;

  return {
    lat: baseLat + latOffset,
    lng: baseLng + lngOffset,
    accuracy: Math.random() < 0.7 ? 10 : 50, // 70% high accuracy
    timestamp: Date.now(),
  };
}
