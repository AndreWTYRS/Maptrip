import type { MapProviderId } from '../providers/types'

export const DEFAULT_PROVIDER: MapProviderId = 'osm'

export function resolveProviderForCountry(_countryCode?: string | null): MapProviderId {
  return DEFAULT_PROVIDER
}
