import {
  UrlTemplateImageryProvider,
  WebMercatorTilingScheme,
} from 'cesium'
import { createOsmProvider } from './openstreetmap'
import type { MapProvider, MapProviderContext } from './types'

/**
 * Google Maps imagery via Map Tiles API.
 * Requires VITE_GOOGLE_MAPS_API_KEY and a session token from your backend
 * (CreateSession: https://developers.google.com/maps/documentation/tile/session_tokens).
 *
 * Without credentials, falls back to OpenStreetMap.
 */
export function createGoogleProvider(context: MapProviderContext = {}): MapProvider {
  return {
    id: 'google',
    name: 'Google Maps',
    createImageryProvider: async () => {
      const sessionToken = import.meta.env.VITE_GOOGLE_MAPS_SESSION_TOKEN
      const apiKey = context.apiKey ?? import.meta.env.VITE_GOOGLE_MAPS_API_KEY

      if (sessionToken && apiKey) {
        return new UrlTemplateImageryProvider({
          url: `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${sessionToken}&key=${apiKey}`,
          tilingScheme: new WebMercatorTilingScheme(),
          maximumLevel: 22,
          credit: '© Google',
        })
      }

      return createOsmProvider().createImageryProvider()
    },
  }
}
