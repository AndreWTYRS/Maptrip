import type { ZoomLevel } from '../zoomLevels'

export type LocationNodeType = 'country' | 'city' | 'district'

export interface LocationTreeNode {
  id: string
  label: string
  type: LocationNodeType
  lat: number
  lon: number
  placeId?: string
  countryCode?: string
  /** H3 cell id for South Korea hex districts */
  hexId?: string
  /** KOSTAT sigungu code (South Korea) */
  guCode?: string
  /** All H3 cells merged into this gu-level district entry */
  hexIds?: string[]
  /** Local-language district name (e.g. Korean gu name) */
  labelOriginal?: string
  /** English district name */
  labelEn?: string
  children?: LocationTreeNode[]
}

export const LOCATION_ZOOM: Record<LocationNodeType, ZoomLevel> = {
  country: 'country',
  city: 'city',
  district: 'district',
}
