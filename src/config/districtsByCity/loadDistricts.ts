import type { LocationTreeNode } from '../locationTree/types'
import { getKrGuById, loadKrGuLookup, sanitizeRings, type KrGuBoundary } from './krGuLookup'

const districtCache = new Map<string, LocationTreeNode[]>()

interface KrDistrictRecord {
  id: string
  guCode: string
  name: string
  nameEn: string
  lat: number
  lon: number
  rings: KrGuBoundary['rings']
}

interface KrDistrictFile {
  cityId: string
  cityLabel: string
  districts: KrDistrictRecord[]
}

function recordToNode(record: KrDistrictRecord): LocationTreeNode {
  return {
    id: record.id,
    label: record.nameEn,
    labelOriginal: record.name,
    labelEn: record.nameEn,
    type: 'district',
    lat: record.lat,
    lon: record.lon,
    guCode: record.guCode,
    boundaryRings: sanitizeRings(record.rings),
    countryCode: 'KR',
  }
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
  if (cached?.length && cached.every((district) => (district.boundaryRings?.length ?? 0) > 0)) {
    return cached
  }

  await loadKrGuLookup()

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

  const districts = payload.districts.map(recordToNode)
  districtCache.set(city.id, districts)
  return districts
}

export function districtKeyForNode(node: LocationTreeNode): string {
  if (node.id.startsWith('kr-gu-')) return node.id
  if (node.guCode) return `kr-gu-${node.guCode}`
  return `${Math.floor(node.lat / 0.011)}:${Math.floor(node.lon / 0.016)}`
}

/** Restore polygon rings stripped from localStorage or missing on cached nodes. */
export async function attachBoundaryRings(
  districts: LocationTreeNode[],
): Promise<LocationTreeNode[]> {
  const needsGuLookup = districts.some((district) => !(district.boundaryRings?.length ?? 0))
  if (!needsGuLookup) return districts

  await loadKrGuLookup()

  return districts.map((district) => {
    if (district.boundaryRings?.length) return district

    const gu = getKrGuById(district.id)
    if (gu?.rings.length) {
      return { ...district, boundaryRings: sanitizeRings(gu.rings) }
    }

    return district
  })
}

export function isDistrictRevealed(node: LocationTreeNode, revealedDistricts: Set<string>): boolean {
  if (node.type !== 'district') return false
  return revealedDistricts.has(districtKeyForNode(node))
}
