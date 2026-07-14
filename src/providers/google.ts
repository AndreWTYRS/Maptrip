import {
  UrlTemplateImageryProvider,
  WebMercatorTilingScheme,
} from 'cesium'
import { getGoogleMapsApiKey } from '../config/googleMaps'
import { GOOGLE_MAP_TILE_LANGUAGE } from '../config/mapLanguage'
import type { MapProvider, MapProviderContext } from './types'

let cachedSessionToken: string | null = null
let sessionExpiresAt = 0

async function createMapTilesSession(apiKey: string): Promise<string | null> {
  const response = await fetch(`https://tile.googleapis.com/v1/createSession?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mapType: 'roadmap',
      language: GOOGLE_MAP_TILE_LANGUAGE,
      region: 'US',
    }),
  })

  if (!response.ok) {
    console.warn('Google Map Tiles createSession failed', response.status)
    return null
  }

  const data = (await response.json()) as { session?: string; expiry?: string }
  if (!data.session) return null

  cachedSessionToken = data.session
  sessionExpiresAt = data.expiry ? Date.parse(data.expiry) : Date.now() + 30 * 60 * 1000
  return data.session
}

async function resolveSessionToken(apiKey: string): Promise<string | null> {
  const envToken = import.meta.env.VITE_GOOGLE_MAPS_SESSION_TOKEN?.trim()
  if (envToken) return envToken

  if (cachedSessionToken && Date.now() < sessionExpiresAt - 60_000) {
    return cachedSessionToken
  }

  return createMapTilesSession(apiKey)
}

/**
 * Google Maps imagery via Map Tiles API.
 * Uses VITE_GOOGLE_MAPS_SESSION_TOKEN or creates a session from VITE_GOOGLE_MAPS_API_KEY.
 */
export function createGoogleProvider(context: MapProviderContext = {}): MapProvider {
  return {
    id: 'google',
    name: 'Google Maps',
    createImageryProvider: async () => {
      const apiKey = context.apiKey ?? getGoogleMapsApiKey()
      if (!apiKey) {
        throw new Error('VITE_GOOGLE_MAPS_API_KEY is required for Google Maps')
      }

      const sessionToken = await resolveSessionToken(apiKey)
      if (!sessionToken) {
        throw new Error('Unable to create Google Map Tiles session')
      }

      return new UrlTemplateImageryProvider({
        url: `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${sessionToken}&key=${apiKey}&language=${GOOGLE_MAP_TILE_LANGUAGE}`,
        tilingScheme: new WebMercatorTilingScheme(),
        maximumLevel: 22,
        credit: '© Google',
      })
    },
  }
}
