import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ISO_COUNTRY_CODES } from '../config/isoCountryCodes'
import { hasGoogleMapsApiKey } from '../config/googleMaps'
import { loadCitiesForCountry, loadCountriesFromOpenData } from '../config/citiesByCountry/loadCities'
import { hasKrHexDistricts, loadDistrictsForCity, attachBoundaryRings } from '../config/districtsByCity/loadDistricts'
import type { LocationTreeNode } from '../config/locationTree/types'
import {
  geocodeAllCountries,
  reverseGeocode,
  type GeocodedCountry,
  type ReverseGeocodeResult,
} from '../services/googleGeocoding'
import {
  autocompleteLocations,
  searchDistrictsInCity,
} from '../services/googlePlaces'

interface GoogleLocationState {
  countries: LocationTreeNode[] | null
  countriesLoading: boolean
  countriesError: string | null
  citiesByCountryId: Record<string, LocationTreeNode[]>
  citiesLoadingId: string | null
  districtsByCityId: Record<string, LocationTreeNode[]>
  districtsLoadingId: string | null
  reverseGeocodeCache: Record<string, ReverseGeocodeResult>
  loadCountries: () => Promise<LocationTreeNode[]>
  loadCities: (country: LocationTreeNode, regionCode?: string) => Promise<LocationTreeNode[]>
  loadDistricts: (city: LocationTreeNode, country: LocationTreeNode) => Promise<LocationTreeNode[]>
  searchLocations: (query: string) => Promise<LocationTreeNode[]>
  resolvePointLocation: (pointId: string, lat: number, lon: number) => Promise<ReverseGeocodeResult | null>
}

function geocodedToNode(country: GeocodedCountry): LocationTreeNode {
  return {
    id: country.id,
    placeId: country.placeId,
    countryCode: country.code,
    label: country.label,
    type: 'country',
    lat: country.lat,
    lon: country.lon,
  }
}

function cacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(3)}:${lon.toFixed(3)}`
}

export const useGoogleLocationStore = create<GoogleLocationState>()(
  persist(
    (set, get) => ({
      countries: null,
      countriesLoading: false,
      countriesError: null,
      citiesByCountryId: {},
      citiesLoadingId: null,
      districtsByCityId: {},
      districtsLoadingId: null,
      reverseGeocodeCache: {},

      loadCountries: async () => {
        const cached = get().countries
        if (cached?.length) return cached

        set({ countriesLoading: true, countriesError: null })
        try {
          if (!hasGoogleMapsApiKey()) {
            const countries = await loadCountriesFromOpenData()
            set({
              countries,
              countriesLoading: false,
              countriesError: countries.length ? null : 'No countries loaded.',
            })
            return countries
          }

          const geocoded = await geocodeAllCountries(ISO_COUNTRY_CODES)
          if (!geocoded.length) {
            const countries = await loadCountriesFromOpenData()
            set({
              countries,
              countriesLoading: false,
              countriesError: countries.length ? null : 'No countries loaded.',
            })
            return countries
          }

          const countries = geocoded.map(geocodedToNode)
          set({ countries, countriesLoading: false, countriesError: null })
          return countries
        } catch {
          const countries = await loadCountriesFromOpenData()
          set({
            countries,
            countriesLoading: false,
            countriesError: countries.length ? null : 'Failed to load countries.',
          })
          return countries
        }
      },

      loadCities: async (country, regionCode) => {
        const cached = get().citiesByCountryId[country.id]
        if (cached) return cached

        set({ citiesLoadingId: country.id })
        try {
          const cities = await loadCitiesForCountry(country, regionCode)
          set((state) => ({
            citiesByCountryId: { ...state.citiesByCountryId, [country.id]: cities },
            citiesLoadingId: null,
          }))
          return cities
        } catch {
          set({ citiesLoadingId: null })
          return []
        }
      },

      loadDistricts: async (city, country) => {
        const cached = get().districtsByCityId[city.id]
        const useKrHex = hasKrHexDistricts(country, city)

        if (cached?.length) {
          if (!useKrHex) return cached

          const ringsComplete = cached.every((district) => (district.boundaryRings?.length ?? 0) > 0)
          if (ringsComplete) return cached

          const enriched = await attachBoundaryRings(cached)
          set((state) => ({
            districtsByCityId: { ...state.districtsByCityId, [city.id]: enriched },
          }))
          return enriched
        }

        set({ districtsLoadingId: city.id })
        try {
          let districts = useKrHex ? await loadDistrictsForCity(city, country) : []

          if (!districts.length && !useKrHex) {
            districts = await searchDistrictsInCity(city.label, country.label, {
              lat: city.lat,
              lon: city.lon,
            })
          }

          if (useKrHex && districts.length) {
            districts = await attachBoundaryRings(districts)
          }

          set((state) => ({
            districtsByCityId: districts.length
              ? { ...state.districtsByCityId, [city.id]: districts }
              : state.districtsByCityId,
            districtsLoadingId: null,
          }))
          return districts
        } catch (error) {
          console.warn('Failed to load districts', city.id, error)
          set({ districtsLoadingId: null })
          return []
        }
      },

      searchLocations: async (query) => {
        try {
          return await autocompleteLocations(query)
        } catch {
          return []
        }
      },

      resolvePointLocation: async (pointId, lat, lon) => {
        const key = cacheKey(lat, lon)
        const cached = get().reverseGeocodeCache[key]
        if (cached) return cached

        const result = await reverseGeocode(lat, lon)
        if (!result) return null

        set((state) => ({
          reverseGeocodeCache: {
            ...state.reverseGeocodeCache,
            [key]: result,
            [`point:${pointId}`]: result,
          },
        }))

        return result
      },
    }),
    {
      name: 'maptrip-google-locations',
      version: 4,
      migrate: (persisted, version) => {
        const state = persisted as {
          countries?: LocationTreeNode[] | null
          citiesByCountryId?: Record<string, LocationTreeNode[]>
          districtsByCityId?: Record<string, LocationTreeNode[]>
          reverseGeocodeCache?: Record<string, ReverseGeocodeResult>
        }
        const base = {
          countries: state.countries ?? null,
          citiesByCountryId: state.citiesByCountryId ?? {},
          reverseGeocodeCache: state.reverseGeocodeCache ?? {},
        }
        if (version < 4) {
          return { ...base, districtsByCityId: {} }
        }
        return { ...base, districtsByCityId: state.districtsByCityId ?? {} }
      },
      partialize: (state) => ({
        countries: state.countries,
        citiesByCountryId: state.citiesByCountryId,
        districtsByCityId: Object.fromEntries(
          Object.entries(state.districtsByCityId).map(([cityId, districts]) => [
            cityId,
            districts.map(({ boundaryRings: _rings, ...district }) => district),
          ]),
        ),
        reverseGeocodeCache: state.reverseGeocodeCache,
      }),
    },
  ),
)
