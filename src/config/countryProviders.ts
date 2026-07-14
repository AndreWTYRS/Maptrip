import type { MapProviderId } from '../providers/types'

/**
 * Maps ISO 3166-1 alpha-2 country codes to preferred map providers.
 * Extend this table as you add regional providers.
 */
export const COUNTRY_PROVIDER_MAP: Record<string, MapProviderId> = {
  RU: 'yandex',
  BY: 'yandex',
  KZ: 'yandex',
}

export const DEFAULT_PROVIDER: MapProviderId = 'google'

export function resolveProviderForCountry(countryCode: string | null): MapProviderId {
  if (!countryCode) return DEFAULT_PROVIDER
  return COUNTRY_PROVIDER_MAP[countryCode.toUpperCase()] ?? DEFAULT_PROVIDER
}
