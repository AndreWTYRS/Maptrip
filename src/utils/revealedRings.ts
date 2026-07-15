import { getKrGuById, isKrGuDistrictKey, type LatLonRing } from '../config/districtsByCity/krGuLookup'
import { circleAsRing } from '../providers/polygonMaskedImagery'
import { DISTRICT_FILL_RADIUS_M } from './districtKey'

interface DistrictPoint {
  lat: number
  lon: number
  districtKey: string
}

export function buildRevealedRings(
  districtKeys: string[],
  points: DistrictPoint[],
  routePoints: DistrictPoint[],
): LatLonRing[] {
  const rings: LatLonRing[] = []

  for (const districtKey of districtKeys) {
    if (isKrGuDistrictKey(districtKey)) {
      const gu = getKrGuById(districtKey)
      if (gu?.rings.length) rings.push(...gu.rings)
      continue
    }

    const samplePoint =
      points.find((point) => point.districtKey === districtKey) ??
      routePoints.find((point) => point.districtKey === districtKey)
    if (samplePoint) {
      rings.push(circleAsRing(samplePoint.lat, samplePoint.lon, DISTRICT_FILL_RADIUS_M))
    }
  }

  return rings
}
