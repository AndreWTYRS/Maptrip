import { getGoogleMapsApiKey } from '../config/googleMaps'
import type { LocationNodeType, LocationTreeNode } from '../config/locationTree/types'

const PLACES_BASE = 'https://places.googleapis.com/v1'

interface PlaceLocation {
  latitude: number
  longitude: number
}

interface PlaceResult {
  id: string
  displayName?: { text: string }
  formattedAddress?: string
  location?: PlaceLocation
  types?: string[]
}

interface SearchTextResponse {
  places?: PlaceResult[]
}

interface AutocompleteResponse {
  suggestions?: Array<{
    placePrediction?: {
      placeId: string
      text?: { text: string }
      types?: string[]
    }
  }>
}

interface PlaceDetailsResponse extends PlaceResult {}

function placeLabel(place: PlaceResult): string {
  return place.displayName?.text ?? place.formattedAddress ?? 'Unknown place'
}

function placeToNode(place: PlaceResult, type: LocationNodeType): LocationTreeNode {
  return {
    id: place.id,
    placeId: place.id,
    label: placeLabel(place),
    type,
    lat: place.location?.latitude ?? 0,
    lon: place.location?.longitude ?? 0,
  }
}

async function placesRequest<T>(
  path: string,
  init: RequestInit,
  fieldMask: string,
): Promise<T | null> {
  const apiKey = getGoogleMapsApiKey()
  if (!apiKey) return null

  const response = await fetch(`${PLACES_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask,
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    console.warn('Google Places request failed', path, response.status)
    return null
  }

  return (await response.json()) as T
}

export async function searchCitiesInCountry(
  countryLabel: string,
  regionCode: string,
): Promise<LocationTreeNode[]> {
  const data = await placesRequest<SearchTextResponse>(
    '/places:searchText',
    {
      method: 'POST',
      body: JSON.stringify({
        textQuery: `cities in ${countryLabel}`,
        includedType: 'locality',
        languageCode: 'en',
        regionCode,
        maxResultCount: 20,
      }),
    },
    'places.id,places.displayName,places.location,places.formattedAddress',
  )

  return (data?.places ?? [])
    .filter((place) => place.location)
    .map((place) => placeToNode(place, 'city'))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export async function searchDistrictsInCity(
  cityLabel: string,
  countryLabel: string,
  center: { lat: number; lon: number },
): Promise<LocationTreeNode[]> {
  const neighborhoodData = await placesRequest<SearchTextResponse>(
    '/places:searchText',
    {
      method: 'POST',
      body: JSON.stringify({
        textQuery: `neighborhoods in ${cityLabel}, ${countryLabel}`,
        includedType: 'neighborhood',
        languageCode: 'en',
        locationBias: {
          circle: {
            center: { latitude: center.lat, longitude: center.lon },
            radius: 40000,
          },
        },
        maxResultCount: 20,
      }),
    },
    'places.id,places.displayName,places.location,places.formattedAddress',
  )

  const sublocalityData = await placesRequest<SearchTextResponse>(
    '/places:searchText',
    {
      method: 'POST',
      body: JSON.stringify({
        textQuery: `districts in ${cityLabel}, ${countryLabel}`,
        includedType: 'sublocality',
        languageCode: 'en',
        locationBias: {
          circle: {
            center: { latitude: center.lat, longitude: center.lon },
            radius: 40000,
          },
        },
        maxResultCount: 20,
      }),
    },
    'places.id,places.displayName,places.location,places.formattedAddress',
  )

  const merged = new Map<string, LocationTreeNode>()

  for (const place of [...(neighborhoodData?.places ?? []), ...(sublocalityData?.places ?? [])]) {
    if (!place.location) continue
    merged.set(place.id, placeToNode(place, 'district'))
  }

  return [...merged.values()].sort((a, b) => a.label.localeCompare(b.label))
}

export async function autocompleteLocations(input: string): Promise<LocationTreeNode[]> {
  if (!input.trim()) return []

  const data = await placesRequest<AutocompleteResponse>(
    '/places:autocomplete',
    {
      method: 'POST',
      body: JSON.stringify({
        input,
        languageCode: 'en',
        includedPrimaryTypes: ['country', 'locality', 'sublocality', 'neighborhood'],
      }),
    },
    'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.types',
  )

  const suggestions = data?.suggestions ?? []
  const nodes: LocationTreeNode[] = []

  for (const suggestion of suggestions) {
    const prediction = suggestion.placePrediction
    if (!prediction?.placeId) continue

    const details = await getPlaceDetails(prediction.placeId)
    if (!details) continue

    nodes.push(details)
  }

  return nodes
}

export async function getPlaceDetails(placeId: string): Promise<LocationTreeNode | null> {
  const data = await placesRequest<PlaceDetailsResponse>(
    `/places/${placeId}`,
    { method: 'GET' },
    'id,displayName,location,formattedAddress,types',
  )

  if (!data?.location) return null

  const types = data.types ?? []
  const type: LocationNodeType = types.includes('country')
    ? 'country'
    : types.includes('locality')
      ? 'city'
      : 'district'

  return placeToNode(data, type)
}
