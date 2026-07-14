import { UrlTemplateImageryProvider, WebMercatorTilingScheme } from 'cesium'
import type { MapProvider } from './types'

/**
 * Wikimedia OSM intl tiles — labels use Latin script (English/transliterated names).
 * @see https://maps.wikimedia.org/
 */
export function createOsmProvider(): MapProvider {
  return {
    id: 'osm',
    name: 'OpenStreetMap',
    createImageryProvider: () =>
      new UrlTemplateImageryProvider({
        url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',
        tilingScheme: new WebMercatorTilingScheme(),
        maximumLevel: 19,
        credit: '© OpenStreetMap contributors · Wikimedia Maps',
      }),
  }
}
