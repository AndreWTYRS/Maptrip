import type { LatLonRing } from '../config/districtsByCity/krGuLookup'
import type { LocationTreeNode } from '../config/locationTree/types'

export interface GeoBounds {
  west: number
  south: number
  east: number
  north: number
}

export function boundsFromRings(
  rings: LatLonRing[],
  paddingRatio = 0.06,
): GeoBounds | undefined {
  if (!rings.length) return undefined

  let minLat = Infinity
  let maxLat = -Infinity
  let minLon = Infinity
  let maxLon = -Infinity

  for (const ring of rings) {
    for (const [lat, lon] of ring) {
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
      minLon = Math.min(minLon, lon)
      maxLon = Math.max(maxLon, lon)
    }
  }

  const latPad = Math.max((maxLat - minLat) * paddingRatio, 0.002)
  const lonPad = Math.max((maxLon - minLon) * paddingRatio, 0.002)

  return {
    west: minLon - lonPad,
    south: minLat - latPad,
    east: maxLon + lonPad,
    north: maxLat + latPad,
  }
}

export function boundsFromDistrictNodes(districts: LocationTreeNode[]): GeoBounds | undefined {
  return boundsFromRings(districts.flatMap((district) => district.boundaryRings ?? []))
}
