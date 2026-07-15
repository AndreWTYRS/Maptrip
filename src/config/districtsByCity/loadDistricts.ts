import type { LocationTreeNode } from '../locationTree/types'

export const KR_H3_RESOLUTION = 7

const districtCache = new Map<string, LocationTreeNode[]>()

type CompactDistrict = [hexId: string, lat: number, lon: number, guCode: string, guName: string]

interface KrDistrictFile {
  cityId: string
  cityLabel: string
  h3Resolution: number
  districts: CompactDistrict[]
}

function compactToNode(tuple: CompactDistrict): LocationTreeNode {
  const [hexId, lat, lon, , guName] = tuple
  return {
    id: `kr-hex-${hexId}`,
    label: guName,
    type: 'district',
    lat,
    lon,
    hexId,
    countryCode: 'KR',
  }
}

export function hasKrHexDistricts(countryCode?: string): boolean {
  return countryCode?.toUpperCase() === 'KR'
}

export async function loadDistrictsForCity(
  city: LocationTreeNode,
  countryCode?: string,
): Promise<LocationTreeNode[]> {
  if (!hasKrHexDistricts(countryCode ?? city.countryCode)) return []

  const cached = districtCache.get(city.id)
  if (cached) return cached

  const response = await fetch(`${import.meta.env.BASE_URL}data/districts/KR/${city.id}.json`)
  if (!response.ok) return []

  const payload = (await response.json()) as KrDistrictFile
  const districts = payload.districts.map(compactToNode)
  districtCache.set(city.id, districts)
  return districts
}

export function districtKeyForNode(node: LocationTreeNode): string {
  return node.hexId ?? `${Math.floor(node.lat / 0.011)}:${Math.floor(node.lon / 0.016)}`
}
