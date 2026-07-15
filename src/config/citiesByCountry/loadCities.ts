import type { LocationTreeNode } from '../locationTree/types'

const cityCache = new Map<string, LocationTreeNode[]>()
let countriesCache: LocationTreeNode[] | null = null

function countryCodeFor(country: LocationTreeNode, regionCode?: string): string {
  return (regionCode ?? country.countryCode ?? country.id.slice(0, 2)).toUpperCase()
}

export async function loadCountriesFromOpenData(): Promise<LocationTreeNode[]> {
  if (countriesCache) return countriesCache

  const response = await fetch(`${import.meta.env.BASE_URL}data/countries.json`)
  if (!response.ok) return []

  const countries = (await response.json()) as LocationTreeNode[]
  countriesCache = countries
  return countries
}

export async function loadCitiesForCountry(
  country: LocationTreeNode,
  regionCode?: string,
): Promise<LocationTreeNode[]> {
  const code = countryCodeFor(country, regionCode)
  const cached = cityCache.get(code)
  if (cached) return cached

  const response = await fetch(`${import.meta.env.BASE_URL}data/cities/${code}.json`)
  if (!response.ok) {
    return []
  }

  const cities = (await response.json()) as LocationTreeNode[]
  cityCache.set(code, cities)
  return cities
}

export function getOpenCitiesCount(): Promise<number> {
  return fetch(`${import.meta.env.BASE_URL}data/cities/index.json`)
    .then((response) => (response.ok ? response.json() : []))
    .then((index: Array<{ count: number }>) =>
      index.reduce((sum, entry) => sum + entry.count, 0),
    )
    .catch(() => 0)
}
