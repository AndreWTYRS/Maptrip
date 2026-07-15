import {
  ImageryProvider,
  Math as CesiumMath,
  Rectangle,
  type ImageryTypes,
  type Request,
} from 'cesium'
import type { ImageryTone } from '../config/mapColors'
import { pointInRing, type LatLonRing } from '../config/districtsByCity/krGuLookup'

interface RingBounds {
  ring: LatLonRing
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

const tileCache = new Map<string, HTMLCanvasElement>()
let tileCacheVersion = 0
const TILE_CACHE_LIMIT = 384

export function bumpPolygonMaskVersion(): void {
  tileCacheVersion += 1
  tileCache.clear()
}

function rememberTile(key: string, canvas: HTMLCanvasElement) {
  if (tileCache.size >= TILE_CACHE_LIMIT) {
    const oldest = tileCache.keys().next().value
    if (oldest) tileCache.delete(oldest)
  }
  tileCache.set(key, canvas)
}

function ringBounds(ring: LatLonRing): RingBounds {
  let minLat = Infinity
  let maxLat = -Infinity
  let minLon = Infinity
  let maxLon = -Infinity
  for (const [lat, lon] of ring) {
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLon = Math.min(minLon, lon)
    maxLon = Math.max(maxLon, lon)
  }
  return { ring, minLat, maxLat, minLon, maxLon }
}

function ringsForTile(tileRect: Rectangle, bounds: RingBounds[]): RingBounds[] {
  const west = CesiumMath.toDegrees(tileRect.west)
  const south = CesiumMath.toDegrees(tileRect.south)
  const east = CesiumMath.toDegrees(tileRect.east)
  const north = CesiumMath.toDegrees(tileRect.north)

  return bounds.filter(
    ({ minLat, maxLat, minLon, maxLon }) =>
      west <= maxLon && east >= minLon && south <= maxLat && north >= minLat,
  )
}

function getImageSize(image: ImageryTypes): { width: number; height: number } {
  if (image instanceof HTMLCanvasElement) return { width: image.width, height: image.height }
  if (image instanceof HTMLImageElement) return { width: image.width, height: image.height }
  if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) {
    return { width: image.width, height: image.height }
  }
  return { width: 256, height: 256 }
}

function toneNeedsProcessing(tone: ImageryTone): boolean {
  return tone.saturation < 0.999 || Math.abs(tone.brightness - 1) > 0.001
}

function applyToneChannel(value: number, gray: number, tone: ImageryTone): number {
  const adjusted = (gray + (value - gray) * tone.saturation) * tone.brightness
  return Math.max(0, Math.min(255, adjusted))
}

function processTile(
  image: ImageryTypes,
  tileRect: Rectangle,
  relevant: RingBounds[],
  tone: ImageryTone,
): HTMLCanvasElement {
  const { width, height } = getImageSize(image)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  ctx.drawImage(image as CanvasImageSource, 0, 0, width, height)
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  const west = CesiumMath.toDegrees(tileRect.west)
  const south = CesiumMath.toDegrees(tileRect.south)
  const east = CesiumMath.toDegrees(tileRect.east)
  const north = CesiumMath.toDegrees(tileRect.north)
  const lonSpan = east - west
  const latSpan = north - south
  const restoreColor = relevant.length > 0

  for (let py = 0; py < height; py++) {
    const lat = north - ((py + 0.5) / height) * latSpan

    for (let px = 0; px < width; px++) {
      const lon = west + ((px + 0.5) / width) * lonSpan
      const offset = (py * width + px) * 4

      if (restoreColor) {
        const inside = relevant.some(({ ring }) => pointInRing(lon, lat, ring))
        if (inside) continue
      }

      const r = data[offset]
      const g = data[offset + 1]
      const b = data[offset + 2]
      const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b
      data[offset] = applyToneChannel(r, gray, tone)
      data[offset + 1] = applyToneChannel(g, gray, tone)
      data[offset + 2] = applyToneChannel(b, gray, tone)
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

/** Approximate circle as a lat/lon ring for non-KR district masking. */
export function circleAsRing(lat: number, lon: number, radiusM: number, segments = 36): LatLonRing {
  const ring: LatLonRing = []
  const latRad = (lat * Math.PI) / 180
  const dLat = radiusM / 111_320
  const dLon = radiusM / (111_320 * Math.cos(latRad))

  for (let i = 0; i < segments; i++) {
    const angle = (2 * Math.PI * i) / segments
    ring.push([lat + dLat * Math.sin(angle), lon + dLon * Math.cos(angle)])
  }
  ring.push(ring[0])
  return ring
}

/**
 * Single imagery provider: desaturates the map and restores full color inside revealed polygons.
 * Avoids two-layer parallax that makes district edges shift while panning.
 */
export function createRevealAwareImageryProvider(
  base: ImageryProvider,
  getRings: () => LatLonRing[],
  getTone: () => ImageryTone,
): ImageryProvider {
  const provider = Object.create(base) as ImageryProvider
  const baseRequestImage = base.requestImage.bind(base)
  let boundsCache: RingBounds[] = []
  let boundsVersion = -1

  provider.requestImage = (x: number, y: number, level: number, request?: Request) => {
    const tone = getTone()
    const rings = getRings()
    const needsTone = toneNeedsProcessing(tone)
    const hasReveal = needsTone && rings.length > 0

    if (!needsTone) {
      return baseRequestImage(x, y, level, request)
    }

    if (boundsVersion !== tileCacheVersion) {
      boundsCache = rings.map(ringBounds)
      boundsVersion = tileCacheVersion
    }

    const tileRect = base.tilingScheme.tileXYToRectangle(x, y, level)
    const relevant = hasReveal ? ringsForTile(tileRect, boundsCache) : []
    const toneKey = `${tone.saturation.toFixed(3)}:${tone.brightness.toFixed(3)}`
    const cacheKey = `${tileCacheVersion}:${toneKey}:${level}:${x}:${y}`
    const cached = tileCache.get(cacheKey)
    if (cached) return Promise.resolve(cached)

    const result = baseRequestImage(x, y, level, request)
    if (!result) return result

    return Promise.resolve(result).then((image) => {
      if (!image) return image

      if (!relevant.length) {
        const processed = processTile(image, tileRect, [], tone)
        rememberTile(cacheKey, processed)
        return processed
      }

      const processed = processTile(image, tileRect, relevant, tone)
      rememberTile(cacheKey, processed)
      return processed
    })
  }

  return provider
}
