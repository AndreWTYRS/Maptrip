export interface MapPoint {
  id: string
  userId: string
  lat: number
  lon: number
  label: string
  districtKey: string
  createdAt: number
}

export interface MapRoute {
  id: string
  userId: string
  name: string
  points: Array<{ lat: number; lon: number; districtKey: string }>
  districtKeys: string[]
  createdAt: number
}

export type AnnotationMode = 'none' | 'point' | 'route'
