import type { LocationTreeNode } from '../locationTree/types'

export const KR_H3_RESOLUTION = 7

const districtCache = new Map<string, LocationTreeNode[]>()

type CompactDistrict =
  | [hexId: string, lat: number, lon: number, guCode: string, guName: string]
  | [
      hexId: string,
      lat: number,
      lon: number,
      guCode: string,
      guName: string,
      guNameEn: string,
    ]

interface KrDistrictFile {
  cityId: string
  cityLabel: string
  h3Resolution: number
  districts: CompactDistrict[]
}

function compactToNode(tuple: CompactDistrict): LocationTreeNode {
  const [hexId, lat, lon, guCode, guName, guNameEn] = tuple
  const labelEn = guNameEn ?? guName
  return {
    id: `kr-hex-${hexId}`,
    label: labelEn,
    labelOriginal: guName,
    labelEn,
    type: 'district',
    lat,
    lon,
    hexId,
    guCode,
    countryCode: 'KR',
  }
}

/** Collapse H3 hex cells into one entry per official sigungu (gu). */
export function aggregateDistrictsByGu(districts: LocationTreeNode[]): LocationTreeNode[] {
  const hexDistricts = districts.filter((district) => district.hexId)
  const otherDistricts = districts.filter((district) => !district.hexId)
  if (!hexDistricts.length) return districts

  const groups = new Map<string, LocationTreeNode[]>()

  for (const district of hexDistricts) {
    const key = district.guCode ?? district.labelOriginal ?? district.label
    const bucket = groups.get(key)
    if (bucket) bucket.push(district)
    else groups.set(key, [district])
  }

  const aggregated = [...groups.values()].map((hexes) => {
    const first = hexes[0]
    const lat = hexes.reduce((sum, hex) => sum + hex.lat, 0) / hexes.length
    const lon = hexes.reduce((sum, hex) => sum + hex.lon, 0) / hexes.length
    const guCode = first.guCode ?? first.labelOriginal ?? first.label

    return {
      id: `kr-gu-${guCode}`,
      label: first.label,
      labelOriginal: first.labelOriginal,
      labelEn: first.labelEn,
      type: 'district' as const,
      lat,
      lon,
      guCode: first.guCode,
      hexIds: hexes.map((hex) => hex.hexId!),
      countryCode: first.countryCode,
    }
  })

  return [...aggregated, ...otherDistricts].sort((a, b) => {
    const labelA = a.labelOriginal ?? a.label
    const labelB = b.labelOriginal ?? b.label
    return labelA.localeCompare(labelB, 'ko')
  })
}

export function resolveCountryCode(country?: LocationTreeNode): string | undefined {
  if (country?.countryCode) return country.countryCode.toUpperCase()
  if (country?.id && country.id.length === 2) return country.id.toUpperCase()
  return undefined
}

export function hasKrHexDistricts(country?: LocationTreeNode, city?: LocationTreeNode): boolean {
  if (resolveCountryCode(country) === 'KR') return true
  return city?.id.startsWith('kr-') ?? false
}

export async function loadDistrictsForCity(
  city: LocationTreeNode,
  country?: LocationTreeNode,
): Promise<LocationTreeNode[]> {
  if (!hasKrHexDistricts(country, city)) return []

  const cached = districtCache.get(city.id)
  if (cached?.length) return cached

  const url = `${import.meta.env.BASE_URL}data/districts/KR/${city.id}.json`
  const response = await fetch(url)
  if (!response.ok) {
    console.warn(`KR districts not found for ${city.id} (${response.status})`, url)
    return []
  }

  const payload = (await response.json()) as KrDistrictFile
  if (!Array.isArray(payload.districts) || payload.districts.length === 0) {
    console.warn(`KR districts file is empty for ${city.id}`)
    return []
  }

  const districts = payload.districts.map(compactToNode)
  districtCache.set(city.id, districts)
  return districts
}

export function districtKeyForNode(node: LocationTreeNode): string {
  if (node.hexId) return node.hexId
  return `${Math.floor(node.lat / 0.011)}:${Math.floor(node.lon / 0.016)}`
}

export function isDistrictRevealed(node: LocationTreeNode, revealedDistricts: Set<string>): boolean {
  if (node.type !== 'district') return false
  if (node.hexIds?.some((hexId) => revealedDistricts.has(hexId))) return true
  return revealedDistricts.has(districtKeyForNode(node))
}
