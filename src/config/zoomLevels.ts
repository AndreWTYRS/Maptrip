export type ZoomLevel = 'world' | 'country' | 'city' | 'district'

export interface ZoomLevelConfig {
  id: ZoomLevel
  label: string
  /** Camera height above ground in meters */
  altitudeMeters: number
}

export const ZOOM_LEVELS: ZoomLevelConfig[] = [
  { id: 'world', label: 'Мир', altitudeMeters: 15_000_000 },
  { id: 'country', label: 'Страна', altitudeMeters: 600_000 },
  { id: 'city', label: 'Город', altitudeMeters: 15_000 },
  { id: 'district', label: 'Район', altitudeMeters: 800 },
]

export const ZOOM_LEVEL_BY_ID = Object.fromEntries(
  ZOOM_LEVELS.map((level) => [level.id, level]),
) as Record<ZoomLevel, ZoomLevelConfig>

/** Upper altitude bound per level — used to detect active level while free-zooming */
export const ZOOM_LEVEL_THRESHOLDS: Array<{ level: ZoomLevel; maxAltitude: number }> = [
  { level: 'district', maxAltitude: 3_000 },
  { level: 'city', maxAltitude: 120_000 },
  { level: 'country', maxAltitude: 2_000_000 },
  { level: 'world', maxAltitude: Infinity },
]
