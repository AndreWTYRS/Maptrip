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
  /** KOSTAT sigungu code (South Korea) */
  guCode?: string
  /** Official boundary rings as [lat, lon][] (outer rings) */
  boundaryRings?: Array<Array<[number, number]>>
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
