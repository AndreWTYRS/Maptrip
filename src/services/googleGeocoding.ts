import { getGoogleMapsApiKey } from '../config/googleMaps'

const GEOCODING_BASE = 'https://maps.googleapis.com/maps/api/geocode/json'

export interface GeocodedCountry {
  id: string
  code: string
  label: string
  lat: number
  lon: number
  placeId: string
}

export interface ReverseGeocodeResult {
  country: string | null
  countryCode: string | null
  city: string | null
  district: string | null
  lat: number
  lon: number
}

interface GeocodeAddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

interface GeocodeResult {
  place_id: string
  formatted_address: string
  geometry: { location: { lat: number; lng: number } }
  address_components: GeocodeAddressComponent[]
}

interface GeocodeResponse {
  status: string
  results?: GeocodeResult[]
}

function pickComponent(
  components: GeocodeAddressComponent[],
  type: string,
): GeocodeAddressComponent | null {
  const match = components.find((component) => component.types.includes(type))
  return match ?? null
}

export async function geocodeCountryCode(code: string): Promise<GeocodedCountry | null> {
  const apiKey = getGoogleMapsApiKey()
  if (!apiKey) return null

  const url = new URL(GEOCODING_BASE)
  url.searchParams.set('components', `country:${code}`)
  url.searchParams.set('language', 'en')
  url.searchParams.set('key', apiKey)

  const response = await fetch(url)
  if (!response.ok) return null

  const data = (await response.json()) as GeocodeResponse
  if (data.status !== 'OK' || !data.results?.[0]) return null

  const result = data.results[0]
  const country = pickComponent(result.address_components, 'country')

  return {
    id: result.place_id,
    code,
    label: country?.long_name ?? code,
    lat: result.geometry.location.lat,
    lon: result.geometry.location.lng,
    placeId: result.place_id,
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult | null> {
  const apiKey = getGoogleMapsApiKey()
  if (!apiKey) return null

  const url = new URL(GEOCODING_BASE)
  url.searchParams.set('latlng', `${lat},${lon}`)
  url.searchParams.set('language', 'en')
  url.searchParams.set('key', apiKey)

  const response = await fetch(url)
  if (!response.ok) return null

  const data = (await response.json()) as GeocodeResponse
  if (data.status !== 'OK' || !data.results?.[0]) return null

  const result = data.results[0]
  const country = pickComponent(result.address_components, 'country')
  const city =
    pickComponent(result.address_components, 'locality') ??
    pickComponent(result.address_components, 'postal_town') ??
    pickComponent(result.address_components, 'administrative_area_level_2')
  const district =
    pickComponent(result.address_components, 'neighborhood') ??
    pickComponent(result.address_components, 'sublocality') ??
    pickComponent(result.address_components, 'sublocality_level_1')

  return {
    country: country?.long_name ?? null,
    countryCode: country?.short_name ?? null,
    city: city?.long_name ?? null,
    district: district?.long_name ?? null,
    lat,
    lon,
  }
}

export async function geocodeAllCountries(
  codes: readonly string[],
  concurrency = 6,
): Promise<GeocodedCountry[]> {
  const results: GeocodedCountry[] = []
  let index = 0

  async function worker() {
    while (index < codes.length) {
      const current = codes[index]
      index += 1
      const country = await geocodeCountryCode(current)
      if (country) results.push(country)
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, codes.length) }, () => worker())
  await Promise.all(workers)

  return results.sort((a, b) => a.label.localeCompare(b.label))
}
