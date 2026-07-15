import {
  findKrGuDistrictKey,
  getKrGuById,
  isKrGuDistrictKey,
  loadKrGuLookup,
} from '../config/districtsByCity/krGuLookup'
export const LAT_CELL = 0.011
export const LON_CELL = 0.016

const KR_BOUNDS = {
  minLat: 33,
  maxLat: 39.5,
  minLon: 124,
  maxLon: 132,
}

export function isInSouthKorea(lat: number, lon: number): boolean {
  return (
    lat >= KR_BOUNDS.minLat &&
    lat <= KR_BOUNDS.maxLat &&
    lon >= KR_BOUNDS.minLon &&
    lon <= KR_BOUNDS.maxLon
  )
}

export { isKrGuDistrictKey as isH3DistrictKey }

export function districtKey(lat: number, lon: number): string {
  if (isInSouthKorea(lat, lon)) {
    const guKey = findKrGuDistrictKey(lat, lon)
    if (guKey) return guKey
  }
  const latCell = Math.floor(lat / LAT_CELL)
  const lonCell = Math.floor(lon / LON_CELL)
  return `${latCell}:${lonCell}`
}

/** Resolves the district key after loading KR gu boundaries when needed. */
export async function resolveDistrictKey(lat: number, lon: number): Promise<string> {
  if (isInSouthKorea(lat, lon)) {
    await loadKrGuLookup()
  }
  return districtKey(lat, lon)
}

export function districtCenter(key: string): { lat: number; lon: number } {
  if (isKrGuDistrictKey(key)) {
    const gu = getKrGuById(key)
    if (gu) return { lat: gu.lat, lon: gu.lon }
  }
  const [latCell, lonCell] = key.split(':').map(Number)
  return {
    lat: (latCell + 0.5) * LAT_CELL,
    lon: (lonCell + 0.5) * LON_CELL,
  }
}

export function districtKeysForCoords(coords: Array<{ lat: number; lon: number }>): string[] {
  return [...new Set(coords.map(({ lat, lon }) => districtKey(lat, lon)))]
}

export async function resolveDistrictKeysForCoords(
  coords: Array<{ lat: number; lon: number }>,
): Promise<string[]> {
  if (coords.some(({ lat, lon }) => isInSouthKorea(lat, lon))) {
    await loadKrGuLookup()
  }
  return districtKeysForCoords(coords)
}

/** Matches ~district zoom viewport at 800 m camera height (non-KR fallback) */
export const DISTRICT_FILL_RADIUS_M = 750

export const DISTRICT_BORDER_CSS = '#ff1493'
export const DISTRICT_BORDER_WIDTH = 3
