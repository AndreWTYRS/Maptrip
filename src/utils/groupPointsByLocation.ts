import { LOCATION_TREE, type LocationTreeNode } from '../config/locationTree'
import type { MapPoint } from '../types/annotations'

export interface PointCityGroup {
  id: string
  label: string
  lat: number
  lon: number
  points: MapPoint[]
}

export interface PointCountryGroup {
  id: string
  label: string
  lat: number
  lon: number
  cities: PointCityGroup[]
}

interface CityRef {
  country: LocationTreeNode
  city: LocationTreeNode
}

function collectCities(
  nodes: LocationTreeNode[],
  country: LocationTreeNode | null = null,
): CityRef[] {
  const refs: CityRef[] = []

  for (const node of nodes) {
    const nextCountry = node.type === 'country' ? node : country
    if (node.type === 'city' && nextCountry) {
      refs.push({ country: nextCountry, city: node })
    }
    if (node.children?.length) {
      refs.push(...collectCities(node.children, nextCountry))
    }
  }

  return refs
}

const CITY_REFS = collectCities(LOCATION_TREE)

function distanceSq(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = lat1 - lat2
  const dLon = lon1 - lon2
  return dLat * dLat + dLon * dLon
}

function nearestCityRef(point: MapPoint): CityRef | null {
  if (CITY_REFS.length === 0) return null

  let best = CITY_REFS[0]
  let bestDist = distanceSq(point.lat, point.lon, best.city.lat, best.city.lon)

  for (let i = 1; i < CITY_REFS.length; i += 1) {
    const ref = CITY_REFS[i]
    const dist = distanceSq(point.lat, point.lon, ref.city.lat, ref.city.lon)
    if (dist < bestDist) {
      best = ref
      bestDist = dist
    }
  }

  return best
}

export function groupPointsByLocation(points: MapPoint[]): PointCountryGroup[] {
  const countryMap = new Map<string, PointCountryGroup>()

  for (const point of points) {
    const ref = nearestCityRef(point)
    const countryId = ref?.country.id ?? 'other'
    const countryLabel = ref?.country.label ?? 'Other locations'
    const countryLat = ref?.country.lat ?? point.lat
    const countryLon = ref?.country.lon ?? point.lon
    const cityId = ref?.city.id ?? `${countryId}-unknown`
    const cityLabel = ref?.city.label ?? 'Unknown city'
    const cityLat = ref?.city.lat ?? point.lat
    const cityLon = ref?.city.lon ?? point.lon

    let country = countryMap.get(countryId)
    if (!country) {
      country = {
        id: countryId,
        label: countryLabel,
        lat: countryLat,
        lon: countryLon,
        cities: [],
      }
      countryMap.set(countryId, country)
    }

    let city = country.cities.find((entry) => entry.id === cityId)
    if (!city) {
      city = {
        id: cityId,
        label: cityLabel,
        lat: cityLat,
        lon: cityLon,
        points: [],
      }
      country.cities.push(city)
    }

    city.points.push(point)
  }

  for (const country of countryMap.values()) {
    country.cities.sort((a, b) => a.label.localeCompare(b.label))
    for (const city of country.cities) {
      city.points.sort((a, b) => a.createdAt - b.createdAt)
    }
  }

  return [...countryMap.values()].sort((a, b) => a.label.localeCompare(b.label))
}

export interface PointSearchEntry {
  point: MapPoint
  path: string
  countryId: string
  cityId: string
}

export function collectPointSearchEntries(groups: PointCountryGroup[]): PointSearchEntry[] {
  const entries: PointSearchEntry[] = []

  for (const country of groups) {
    for (const city of country.cities) {
      for (const point of city.points) {
        entries.push({
          point,
          path: `${country.label} · ${city.label}`,
          countryId: country.id,
          cityId: city.id,
        })
      }
    }
  }

  return entries
}
