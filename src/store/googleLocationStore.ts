import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ISO_COUNTRY_CODES } from '../config/isoCountryCodes'
import type { LocationTreeNode } from '../config/locationTree/types'
import {
  geocodeAllCountries,
  reverseGeocode,
  type GeocodedCountry,
  type ReverseGeocodeResult,
} from '../services/googleGeocoding'
import {
  autocompleteLocations,
  searchCitiesInCountry,
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
          const geocoded = await geocodeAllCountries(ISO_COUNTRY_CODES)
          if (!geocoded.length) {
            set({
              countriesLoading: false,
              countriesError: 'Google Geocoding API unavailable. Check VITE_GOOGLE_MAPS_API_KEY.',
            })
            return []
          }

          const countries = geocoded.map(geocodedToNode)
          set({ countries, countriesLoading: false, countriesError: null })
          return countries
        } catch {
          set({
            countriesLoading: false,
            countriesError: 'Failed to load countries from Google.',
          })
          return []
        }
      },

      loadCities: async (country, regionCode) => {
        const cached = get().citiesByCountryId[country.id]
        if (cached) return cached

        set({ citiesLoadingId: country.id })
        try {
          const code = regionCode ?? country.countryCode ?? country.id.slice(0, 2).toUpperCase()
          const cities = await searchCitiesInCountry(country.label, code)
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
        if (cached) return cached

        set({ districtsLoadingId: city.id })
        try {
          const districts = await searchDistrictsInCity(city.label, country.label, {
            lat: city.lat,
            lon: city.lon,
          })
          set((state) => ({
            districtsByCityId: { ...state.districtsByCityId, [city.id]: districts },
            districtsLoadingId: null,
          }))
          return districts
        } catch {
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
      partialize: (state) => ({
        countries: state.countries,
        citiesByCountryId: state.citiesByCountryId,
        districtsByCityId: state.districtsByCityId,
        reverseGeocodeCache: state.reverseGeocodeCache,
      }),
    },
  ),
)
