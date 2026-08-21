import type { Coordinate } from '../model/types';

/**
 * A single coordinate, captured once, when the hunter asks for it.
 *
 * expo-location is native and absent from builds made before it was added, so it
 * is required lazily and every failure — no module, no permission, no fix —
 * returns null rather than throwing. Nothing about logging a harvest should ever
 * depend on the sky being clear.
 */
type LocationModule = typeof import('expo-location');

let cached: LocationModule | null | undefined;

function locationModule(): LocationModule | null {
  if (cached !== undefined) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('expo-location') as LocationModule;
  } catch {
    cached = null;
  }
  return cached;
}

export function locationAvailable(): boolean {
  return locationModule() !== null;
}

export async function captureCoordinate(): Promise<Coordinate | null> {
  const Location = locationModule();
  if (!Location) return null;
  try {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) return null;
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return null;
  }
}

/** "39.4256°N, 123.3094°W" — precise enough to mean something, short enough to read. */
export function formatCoordinate(coordinate: Coordinate): string {
  const lat = `${Math.abs(coordinate.latitude).toFixed(4)}°${coordinate.latitude >= 0 ? 'N' : 'S'}`;
  const lon = `${Math.abs(coordinate.longitude).toFixed(4)}°${coordinate.longitude >= 0 ? 'E' : 'W'}`;
  return `${lat}, ${lon}`;
}

export function mapsUrl(coordinate: Coordinate, label: string): string {
  const query = encodeURIComponent(label);
  return `https://maps.apple.com/?ll=${coordinate.latitude},${coordinate.longitude}&q=${query}`;
}
