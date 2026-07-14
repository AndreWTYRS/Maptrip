import { create } from 'zustand'
import type { MapProviderId } from '../providers/types'
import type { ZoomLevel } from '../config/zoomLevels'

interface FlyToLevelRequest {
  level: ZoomLevel
  token: number
}

interface GlobeState {
  providerId: MapProviderId
  countryCode: string | null
  altitudeMeters: number
  centerLat: number
  centerLon: number
  zoomLevel: ZoomLevel
  flyToLevelRequest: FlyToLevelRequest | null
  setProviderId: (id: MapProviderId) => void
  setCountryCode: (code: string | null) => void
  setAltitudeMeters: (altitude: number) => void
  setCenter: (lat: number, lon: number) => void
  setZoomLevel: (level: ZoomLevel) => void
  requestFlyToLevel: (level: ZoomLevel) => void
  clearFlyToRequest: () => void
}

let flyToToken = 0

export const useGlobeStore = create<GlobeState>((set) => ({
  providerId: 'google',
  countryCode: null,
  altitudeMeters: 12_000_000,
  centerLat: 55.7558,
  centerLon: 37.6173,
  zoomLevel: 'world',
  flyToLevelRequest: null,
  setProviderId: (providerId) => set({ providerId }),
  setCountryCode: (countryCode) => set({ countryCode }),
  setAltitudeMeters: (altitudeMeters) => set({ altitudeMeters }),
  setCenter: (centerLat, centerLon) => set({ centerLat, centerLon }),
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),
  requestFlyToLevel: (level) =>
    set({ flyToLevelRequest: { level, token: ++flyToToken } }),
  clearFlyToRequest: () => set({ flyToLevelRequest: null }),
}))
