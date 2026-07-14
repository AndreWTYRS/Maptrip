import type { MapPoint } from '../types/annotations'
import type { ReverseGeocodeResult } from '../services/googleGeocoding'

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

function locationKey(value: string | null | undefined, fallback: string): string {
  return (value ?? fallback).toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export function groupPointsByGeocoding(
  points: MapPoint[],
  geocoded: Map<string, ReverseGeocodeResult | null>,
): PointCountryGroup[] {
  const countryMap = new Map<string, PointCountryGroup>()

  for (const point of points) {
    const location = geocoded.get(point.id)
    const countryLabel = location?.country ?? 'Other locations'
    const countryId = locationKey(location?.countryCode, 'other')
    const cityLabel = location?.city ?? 'Unknown city'
    const cityId = `${countryId}-${locationKey(cityLabel, 'unknown')}`

    let country = countryMap.get(countryId)
    if (!country) {
      country = {
        id: countryId,
        label: countryLabel,
        lat: point.lat,
        lon: point.lon,
        cities: [],
      }
      countryMap.set(countryId, country)
    }

    let city = country.cities.find((entry) => entry.id === cityId)
    if (!city) {
      city = {
        id: cityId,
        label: cityLabel,
        lat: point.lat,
        lon: point.lon,
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
