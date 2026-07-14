import type { ZoomLevel } from '../zoomLevels'

export type LocationNodeType = 'country' | 'city' | 'district'

export interface LocationTreeNode {
  id: string
  label: string
  type: LocationNodeType
  lat: number
  lon: number
  children?: LocationTreeNode[]
}

export const LOCATION_ZOOM: Record<LocationNodeType, ZoomLevel> = {
  country: 'country',
  city: 'city',
  district: 'district',
}
