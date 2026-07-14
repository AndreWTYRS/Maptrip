/** ISO 3166-1 alpha-2 → English country name (for HUD display) */
const COUNTRY_NAMES: Record<string, string> = {
  RU: 'Russia',
  BY: 'Belarus',
  KZ: 'Kazakhstan',
  US: 'United States',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  BR: 'Brazil',
  JP: 'Japan',
  CN: 'China',
}

export function countryNameEn(code: string | null): string | null {
  if (!code) return null
  return COUNTRY_NAMES[code.toUpperCase()] ?? code
}
