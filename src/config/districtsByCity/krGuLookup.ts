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

function ringIsValid(ring: unknown): ring is LatLonRing {
  if (!Array.isArray(ring) || ring.length < 4) return false

  const uniq = new Set<string>()
  for (const point of ring) {
    if (!Array.isArray(point) || point.length < 2) return false
    const [lat, lon] = point
    if (typeof lat !== 'number' || typeof lon !== 'number') return false
    uniq.add(`${lat.toFixed(5)},${lon.toFixed(5)}`)
  }

  return uniq.size >= 3
}

export function sanitizeRings(rings: LatLonRing[] | undefined): LatLonRing[] {
  return (rings ?? []).filter(ringIsValid)
}

export function pointInRing(lon: number, lat: number, ring: LatLonRing): boolean {
  if (!ringIsValid(ring)) return false

  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [yi, xi] = ring[i]
    const [yj, xj] = ring[j]
    const intersect =
      yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi + 0.0) + xi
    if (intersect) inside = !inside
  }
  return inside
}

export function pointInGuRings(lon: number, lat: number, rings: LatLonRing[] | undefined): boolean {
  return sanitizeRings(rings).some((ring) => pointInRing(lon, lat, ring))
}

export function ringToCesiumDegrees(ring: LatLonRing): number[] {
  return ring.flatMap(([lat, lon]) => [lon, lat])
}

async function parseGuLookupResponse(response: Response): Promise<KrGuBoundary[]> {
  if (!response.ok) return []

  const text = await response.text()
  if (!text.trimStart().startsWith('[')) return []

  const lookup = JSON.parse(text) as KrGuBoundary[]
  return lookup
    .map((gu) => ({
      ...gu,
      rings: sanitizeRings(gu.rings),
    }))
    .filter((gu) => gu.rings.length > 0)
}

export async function loadKrGuLookup(): Promise<KrGuBoundary[]> {
  if (guLookupCache) return guLookupCache
  if (guLookupPromise) return guLookupPromise

  guLookupPromise = fetch(`${import.meta.env.BASE_URL}data/districts/KR/gu-lookup.json`)
    .then(parseGuLookupResponse)
    .then((lookup) => {
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

export function ringIsRenderable(ring: unknown): ring is LatLonRing {
  return ringIsValid(ring)
}
