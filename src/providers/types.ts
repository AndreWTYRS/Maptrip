import type { ImageryProvider } from 'cesium'

export type MapProviderId = 'google' | 'yandex' | 'osm'

export interface MapProvider {
  id: MapProviderId
  name: string
  createImageryProvider: () => ImageryProvider | Promise<ImageryProvider>
}

export interface MapProviderContext {
  apiKey?: string
}
