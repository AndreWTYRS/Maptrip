export function getGoogleMapsApiKey(): string | undefined {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  return key?.trim() || undefined
}

export function hasGoogleMapsApiKey(): boolean {
  return Boolean(getGoogleMapsApiKey())
}
