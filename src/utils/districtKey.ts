import { cellToLatLng, latLngToCell } from 'h3-js'

/** ~1.2 km district cell at mid-latitudes (default outside KR) */
export const LAT_CELL = 0.011
export const LON_CELL = 0.016

/** H3 resolution for South Korea hex districts (KOSTAT sigungu tessellation). */
export const KR_H3_RES = 7

const KR_BOUNDS = {
  minLat: 33,
  maxLat: 39.5,
  minLon: 124,
  maxLon: 132,
}

const H3_KEY_RE = /^[0-9a-f]{15}$/i

export function isInSouthKorea(lat: number, lon: number): boolean {
  return (
    lat >= KR_BOUNDS.minLat &&
    lat <= KR_BOUNDS.maxLat &&
    lon >= KR_BOUNDS.minLon &&
    lon <= KR_BOUNDS.maxLon
  )
}

export function isH3DistrictKey(key: string): boolean {
  return H3_KEY_RE.test(key)
}

export function districtKey(lat: number, lon: number): string {
  if (isInSouthKorea(lat, lon)) {
    return latLngToCell(lat, lon, KR_H3_RES)
  }
  const latCell = Math.floor(lat / LAT_CELL)
  const lonCell = Math.floor(lon / LON_CELL)
  return `${latCell}:${lonCell}`
}

export function districtCenter(key: string): { lat: number; lon: number } {
  if (isH3DistrictKey(key)) {
    const [lat, lon] = cellToLatLng(key)
    return { lat, lon }
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

/** Matches ~district zoom viewport at 800 m camera height (non-H3 fallback) */
export const DISTRICT_FILL_RADIUS_M = 750

export const DISTRICT_BORDER_CSS = '#ff1493'
export const DISTRICT_BORDER_WIDTH = 1.5
