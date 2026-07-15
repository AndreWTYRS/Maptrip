export type LatLonRing = Array<[lat: number, lon: number]>

export interface KrGuBoundary {
  id: string
  guCode: string
  name: string
  nameEn: string
  lat: number
  lon: number
  rings: LatLonRing[]
}

let guLookupCache: KrGuBoundary[] | null = null
let guLookupPromise: Promise<KrGuBoundary[]> | null = null

function pointInRing(lon: number, lat: number, ring: LatLonRing): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i--) {
    const [yi, xi] = ring[i]
    const [yj, xj] = ring[j]
    const intersect =
      yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi + 0.0) + xi
    if (intersect) inside = !inside
  }
  return inside
}

export function pointInGuRings(lon: number, lat: number, rings: LatLonRing[]): boolean {
  return rings.some((ring) => ring.length >= 4 && pointInRing(lon, lat, ring))
}

export function ringToCesiumDegrees(ring: LatLonRing): number[] {
  return ring.flatMap(([lat, lon]) => [lon, lat])
}

export async function loadKrGuLookup(): Promise<KrGuBoundary[]> {
  if (guLookupCache) return guLookupCache
  if (guLookupPromise) return guLookupPromise

  guLookupPromise = fetch(`${import.meta.env.BASE_URL}data/districts/KR/gu-lookup.json`)
    .then((response) => (response.ok ? response.json() : []))
    .then((lookup: KrGuBoundary[]) => {
      guLookupCache = lookup
      return lookup
    })
    .catch(() => {
      guLookupCache = []
      return []
    })

  return guLookupPromise
}

export function getKrGuLookupSync(): KrGuBoundary[] | null {
  return guLookupCache
}

export function findKrGuDistrictKey(lat: number, lon: number): string | null {
  const lookup = guLookupCache
  if (!lookup) return null

  for (const gu of lookup) {
    if (pointInGuRings(lon, lat, gu.rings)) return gu.id
  }
  return null
}

export function getKrGuById(id: string): KrGuBoundary | undefined {
  return guLookupCache?.find((gu) => gu.id === id)
}

export function isKrGuDistrictKey(key: string): boolean {
  return key.startsWith('kr-gu-')
}
