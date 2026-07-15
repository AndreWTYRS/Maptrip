import { createOsmProvider } from './openstreetmap'
import type { MapProvider, MapProviderContext, MapProviderId } from './types'

const factories: Record<MapProviderId, (ctx?: MapProviderContext) => MapProvider> = {
  osm: createOsmProvider,
}

export function getMapProvider(id: MapProviderId, context?: MapProviderContext): MapProvider {
  return factories[id](context)
}

export function listMapProviders(): MapProviderId[] {
  return Object.keys(factories) as MapProviderId[]
}
