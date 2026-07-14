import type { MapProviderId } from '../providers/types'

/** Google Maps is the sole map provider. */
export const DEFAULT_PROVIDER: MapProviderId = 'google'

export function resolveProviderForCountry(): MapProviderId {
  return DEFAULT_PROVIDER
}
