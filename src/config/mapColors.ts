import type { ZoomLevel } from './zoomLevels'

export type MapColorScheme = 'color' | 'gray-cool' | 'gray-neutral' | 'gray-warm'

const GRAY_SCHEME_BY_LEVEL: Record<Exclude<ZoomLevel, 'world'>, MapColorScheme> = {
  country: 'gray-cool',
  city: 'gray-neutral',
  district: 'gray-warm',
}

export function resolveMapColorScheme(
  zoomLevel: ZoomLevel,
  isInputRevealed: boolean,
): MapColorScheme {
  if (zoomLevel === 'world') return 'color'
  if (isInputRevealed) return 'color'
  return GRAY_SCHEME_BY_LEVEL[zoomLevel]
}
