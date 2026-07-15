import { create } from 'zustand'
import type { MapProviderId } from '../providers/types'
import type { ZoomLevel } from '../config/zoomLevels'

interface FlyToLevelRequest {
  level: ZoomLevel
  token: number
}

interface FlyToLocationRequest {
  lat: number
  lon: number
  level: ZoomLevel
  token: number
  bounds?: { west: number; south: number; east: number; north: number }
}

interface GlobeState {
  providerId: MapProviderId
  countryCode: string | null
  altitudeMeters: number
  centerLat: number
  centerLon: number
  zoomLevel: ZoomLevel
  selectedLocationId: string | null
  /** City whose hex district borders are drawn on the globe (South Korea). */
  activeDistrictCityId: string | null
  /** Selected gu district id (kr-gu-*) for boundary highlight. */
  activeDistrictId: string | null
  flyToLevelRequest: FlyToLevelRequest | null
  flyToLocationRequest: FlyToLocationRequest | null
  setProviderId: (id: MapProviderId) => void
  setCountryCode: (code: string | null) => void
  setAltitudeMeters: (altitude: number) => void
  setCenter: (lat: number, lon: number) => void
  setZoomLevel: (level: ZoomLevel) => void
  setSelectedLocationId: (id: string | null) => void
  setActiveDistrictCityId: (id: string | null) => void
  setActiveDistrictId: (id: string | null) => void
  requestFlyToLevel: (level: ZoomLevel) => void
  requestFlyToLocation: (lat: number, lon: number, level: ZoomLevel, bounds?: FlyToLocationRequest['bounds']) => void
  clearFlyToRequest: () => void
}

let flyToToken = 0

export const useGlobeStore = create<GlobeState>((set) => ({
  providerId: 'osm',
  countryCode: null,
  altitudeMeters: 12_000_000,
  centerLat: 55.7558,
  centerLon: 37.6173,
  zoomLevel: 'world',
  selectedLocationId: null,
  activeDistrictCityId: null,
  activeDistrictId: null,
  flyToLevelRequest: null,
  flyToLocationRequest: null,
  setProviderId: (providerId) => set({ providerId }),
  setCountryCode: (countryCode) => set({ countryCode }),
  setAltitudeMeters: (altitudeMeters) => set({ altitudeMeters }),
  setCenter: (centerLat, centerLon) => set({ centerLat, centerLon }),
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),
  setSelectedLocationId: (selectedLocationId) => set({ selectedLocationId }),
  setActiveDistrictCityId: (activeDistrictCityId) => set({ activeDistrictCityId }),
  setActiveDistrictId: (activeDistrictId) => set({ activeDistrictId }),
  requestFlyToLevel: (level) =>
    set({ flyToLevelRequest: { level, token: ++flyToToken } }),
  requestFlyToLocation: (lat, lon, level, bounds?) =>
    set({
      centerLat: lat,
      centerLon: lon,
      flyToLocationRequest: { lat, lon, level, token: ++flyToToken, bounds },
    }),
  clearFlyToRequest: () =>
    set({ flyToLevelRequest: null, flyToLocationRequest: null }),
}))
