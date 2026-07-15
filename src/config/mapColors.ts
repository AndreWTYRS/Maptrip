import type { ZoomLevel } from './zoomLevels'

export type MapColorScheme = 'color' | 'gray-cool' | 'gray-neutral' | 'gray-warm'

const GRAY_SCHEME_BY_LEVEL: Record<Exclude<ZoomLevel, 'world'>, MapColorScheme> = {
  country: 'gray-cool',
  city: 'gray-neutral',
  district: 'gray-warm',
}

/** HUD label only — base map desaturation is applied to imagery layers in GlobeViewer. */
export function resolveMapColorScheme(zoomLevel: ZoomLevel): MapColorScheme {
  if (zoomLevel === 'world') return 'color'
  return GRAY_SCHEME_BY_LEVEL[zoomLevel]
}

export interface ImageryTone {
  saturation: number
  brightness: number
}

const IMAGERY_TONE_BY_LEVEL: Record<ZoomLevel, ImageryTone> = {
  world: { saturation: 1, brightness: 1 },
  country: { saturation: 0.35, brightness: 0.9 },
  city: { saturation: 0.2, brightness: 0.82 },
  district: { saturation: 0.45, brightness: 0.88 },
}

export function imageryToneForZoomLevel(zoomLevel: ZoomLevel): ImageryTone {
  return IMAGERY_TONE_BY_LEVEL[zoomLevel]
}
