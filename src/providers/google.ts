import {
  UrlTemplateImageryProvider,
  WebMercatorTilingScheme,
} from 'cesium'
import { GOOGLE_MAP_TILE_LANGUAGE } from '../config/mapLanguage'
import { createOsmProvider } from './openstreetmap'
import type { MapProvider, MapProviderContext } from './types'

/**
 * Google Maps imagery via Map Tiles API.
 * Requires VITE_GOOGLE_MAPS_API_KEY and a session token from your backend
 * (CreateSession: https://developers.google.com/maps/documentation/tile/session_tokens).
 * Set language to en-US in the CreateSession request body for English labels.
 *
 * Without credentials, falls back to OpenStreetMap (Latin/English labels).
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
          url: `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${sessionToken}&key=${apiKey}&language=${GOOGLE_MAP_TILE_LANGUAGE}`,
          tilingScheme: new WebMercatorTilingScheme(),
          maximumLevel: 22,
          credit: '© Google',
        })
      }

      return createOsmProvider().createImageryProvider()
    },
  }
}
