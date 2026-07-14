import { UrlTemplateImageryProvider, WebMercatorTilingScheme } from 'cesium'
import type { MapProvider, MapProviderContext } from './types'

/**
 * Yandex Maps placeholder — wire your tile URL / API key for RU/CIS regions.
 * Docs: https://yandex.ru/dev/maps/
 */
export function createYandexProvider(context: MapProviderContext = {}): MapProvider {
  const apiKey = context.apiKey ?? import.meta.env.VITE_YANDEX_MAPS_API_KEY

  return {
    id: 'yandex',
    name: 'Yandex Maps',
    createImageryProvider: () => {
      if (!apiKey) {
        throw new Error('VITE_YANDEX_MAPS_API_KEY is required for Yandex provider')
      }

      return new UrlTemplateImageryProvider({
        url: `https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&lang=ru_RU&apikey=${apiKey}`,
        tilingScheme: new WebMercatorTilingScheme(),
        maximumLevel: 19,
        credit: '© Yandex',
      })
    },
  }
}
