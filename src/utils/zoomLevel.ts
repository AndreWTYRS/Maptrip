import {
  ZOOM_LEVEL_BY_ID,
  ZOOM_LEVEL_THRESHOLDS,
  type ZoomLevel,
} from '../config/zoomLevels'

export function altitudeToZoomLevel(altitudeMeters: number): ZoomLevel {
  for (const { level, maxAltitude } of ZOOM_LEVEL_THRESHOLDS) {
    if (altitudeMeters <= maxAltitude) return level
  }
  return 'country'
}

export function getAltitudeForLevel(level: ZoomLevel): number {
  return ZOOM_LEVEL_BY_ID[level].altitudeMeters
}
