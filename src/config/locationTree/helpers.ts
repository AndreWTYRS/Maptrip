import type { LocationTreeNode } from './types'

export function district(
  id: string,
  label: string,
  lat: number,
  lon: number,
): LocationTreeNode {
  return { id, label, type: 'district', lat, lon }
}

export function defaultDistricts(prefix: string, lat: number, lon: number): LocationTreeNode[] {
  return [
    district(`${prefix}-central`, 'Central', lat, lon),
    district(`${prefix}-north`, 'North', lat + 0.012, lon),
  ]
}

export function city(
  id: string,
  label: string,
  lat: number,
  lon: number,
  districts: LocationTreeNode[],
): LocationTreeNode {
  return { id, label, type: 'city', lat, lon, children: districts }
}

export function capitalCity(
  countryId: string,
  label: string,
  lat: number,
  lon: number,
  districts?: LocationTreeNode[],
): LocationTreeNode {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return city(`${countryId}-${slug}`, label, lat, lon, districts ?? defaultDistricts(`${countryId}-${slug}`, lat, lon))
}

export function country(
  id: string,
  label: string,
  lat: number,
  lon: number,
  cities: LocationTreeNode[],
): LocationTreeNode {
  return { id, label, type: 'country', lat, lon, children: cities }
}

/** One capital city with default central/north districts. */
export function simpleCountry(
  id: string,
  label: string,
  lat: number,
  lon: number,
  capitalLabel: string,
): LocationTreeNode {
  return country(id, label, lat, lon, [capitalCity(id, capitalLabel, lat, lon)])
}
