import { UrlTemplateImageryProvider, WebMercatorTilingScheme } from 'cesium'
import type { MapProvider } from './types'

/**
 * CARTO Voyager — OSM-based tiles with Latin-script labels where available.
 * Wikimedia osm-intl returns 403 from browser/Cesium requests.
 */
export function createOsmProvider(): MapProvider {
  return {
    id: 'osm',
    name: 'OpenStreetMap',
    createImageryProvider: () =>
      new UrlTemplateImageryProvider({
        url: 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        tilingScheme: new WebMercatorTilingScheme(),
        maximumLevel: 20,
        credit: '© OpenStreetMap contributors · © CARTO',
      }),
  }
}
