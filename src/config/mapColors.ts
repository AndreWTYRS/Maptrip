import type { ZoomLevel } from './zoomLevels'
import { districtKey } from '../utils/districtKey'

export type MapColorScheme = 'color' | 'gray-cool' | 'gray-neutral' | 'gray-warm'

const GRAY_SCHEME_BY_LEVEL: Record<Exclude<ZoomLevel, 'world'>, MapColorScheme> = {
  country: 'gray-cool',
  city: 'gray-neutral',
  district: 'gray-warm',
}

export function resolveMapColorScheme(
  zoomLevel: ZoomLevel,
  isInputRevealed: boolean,
  centerLat: number,
  centerLon: number,
  revealedDistricts: Set<string>,
): MapColorScheme {
  if (zoomLevel === 'world') return 'color'

  const currentDistrict = districtKey(centerLat, centerLon)
  if (revealedDistricts.has(currentDistrict)) return 'color'

  if (isInputRevealed) return 'color'

  return GRAY_SCHEME_BY_LEVEL[zoomLevel]
}
