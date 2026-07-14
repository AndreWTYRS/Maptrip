/** ~1.2 km district cell at mid-latitudes */
export const LAT_CELL = 0.011
export const LON_CELL = 0.016

export function districtKey(lat: number, lon: number): string {
  const latCell = Math.floor(lat / LAT_CELL)
  const lonCell = Math.floor(lon / LON_CELL)
  return `${latCell}:${lonCell}`
}

export function districtCenter(key: string): { lat: number; lon: number } {
  const [latCell, lonCell] = key.split(':').map(Number)
  return {
    lat: (latCell + 0.5) * LAT_CELL,
    lon: (lonCell + 0.5) * LON_CELL,
  }
}

export function districtKeysForCoords(coords: Array<{ lat: number; lon: number }>): string[] {
  return [...new Set(coords.map(({ lat, lon }) => districtKey(lat, lon)))]
}

/** Approximate district fill radius in meters */
export const DISTRICT_FILL_RADIUS_M = 1200
