/**
 * Lightweight country lookup by coordinates (major bounding boxes).
 * Replace with reverse geocoding in production for accuracy.
 */
const COUNTRY_BBOX: Array<{ code: string; minLat: number; maxLat: number; minLon: number; maxLon: number }> = [
  { code: 'RU', minLat: 41, maxLat: 82, minLon: 19, maxLon: 180 },
  { code: 'BY', minLat: 51, maxLat: 57, minLon: 23, maxLon: 33 },
  { code: 'KZ', minLat: 40, maxLat: 56, minLon: 46, maxLon: 88 },
  { code: 'US', minLat: 24, maxLat: 50, minLon: -125, maxLon: -66 },
  { code: 'GB', minLat: 49, maxLat: 61, minLon: -8, maxLon: 2 },
  { code: 'DE', minLat: 47, maxLat: 55, minLon: 5, maxLon: 16 },
  { code: 'FR', minLat: 41, maxLat: 51, minLon: -5, maxLon: 10 },
  { code: 'BR', minLat: -34, maxLat: 5, minLon: -74, maxLon: -34 },
  { code: 'KR', minLat: 33, maxLat: 39.5, minLon: 124, maxLon: 132 },
  { code: 'JP', minLat: 24, maxLat: 46, minLon: 122, maxLon: 146 },
  { code: 'CN', minLat: 18, maxLat: 54, minLon: 73, maxLon: 135 },
]

export function countryFromCoords(lat: number, lon: number): string | null {
  for (const box of COUNTRY_BBOX) {
    if (lat >= box.minLat && lat <= box.maxLat && lon >= box.minLon && lon <= box.maxLon) {
      return box.code
    }
  }
  return null
}
