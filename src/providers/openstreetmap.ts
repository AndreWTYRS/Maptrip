import { OpenStreetMapImageryProvider } from 'cesium'
import type { MapProvider } from './types'

export function createOsmProvider(): MapProvider {
  return {
    id: 'osm',
    name: 'OpenStreetMap',
    createImageryProvider: () =>
      new OpenStreetMapImageryProvider({
        url: 'https://tile.openstreetmap.org/',
      }),
  }
}
