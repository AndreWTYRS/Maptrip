import {
  ImageryProvider,
  Math as CesiumMath,
  Rectangle,
  type ImageryTypes,
  type Request,
} from 'cesium'
import { pointInRing, type LatLonRing } from '../config/districtsByCity/krGuLookup'

/** Mask in coarse blocks — ~64× fewer point-in-polygon checks per tile. */
const MASK_BLOCK = 8

interface RingBounds {
  ring: LatLonRing
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

const maskCache = new Map<string, HTMLCanvasElement>()
let maskVersion = 0
const MASK_CACHE_LIMIT = 256

export function bumpPolygonMaskVersion(): void {
  maskVersion += 1
  maskCache.clear()
}

function rememberMaskedTile(key: string, canvas: HTMLCanvasElement) {
  if (maskCache.size >= MASK_CACHE_LIMIT) {
    const oldest = maskCache.keys().next().value
    if (oldest) maskCache.delete(oldest)
  }
  maskCache.set(key, canvas)
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

function getTransparentTile(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

function maskImage(
  image: ImageryTypes,
  tileRect: Rectangle,
  relevant: RingBounds[],
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

  for (let by = 0; by < height; by += MASK_BLOCK) {
    const blockH = Math.min(MASK_BLOCK, height - by)
    const lat = north - ((by + blockH * 0.5) / height) * latSpan

    for (let bx = 0; bx < width; bx += MASK_BLOCK) {
      const blockW = Math.min(MASK_BLOCK, width - bx)
      const lon = west + ((bx + blockW * 0.5) / width) * lonSpan

      const inside = relevant.some(({ ring }) => pointInRing(lon, lat, ring))
      if (inside) continue

      for (let py = 0; py < blockH; py++) {
        const row = (by + py) * width
        for (let px = 0; px < blockW; px++) {
          data[(row + bx + px) * 4 + 3] = 0
        }
      }
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

export function unionRectangleForRings(rings: LatLonRing[]): Rectangle | undefined {
  if (!rings.length) return undefined

  let minLat = Infinity
  let maxLat = -Infinity
  let minLon = Infinity
  let maxLon = -Infinity

  for (const ring of rings) {
    for (const [lat, lon] of ring) {
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
      minLon = Math.min(minLon, lon)
      maxLon = Math.max(maxLon, lon)
    }
  }

  return Rectangle.fromDegrees(minLon, minLat, maxLon, maxLat)
}

export function createPolygonMaskedImageryProvider(
  base: ImageryProvider,
  getRings: () => LatLonRing[],
): ImageryProvider {
  const provider = Object.create(base) as ImageryProvider
  const baseRequestImage = base.requestImage.bind(base)
  let boundsCache: RingBounds[] = []
  let boundsVersion = -1

  Object.defineProperty(provider, 'hasAlphaChannel', {
    configurable: true,
    get: () => true,
  })

  provider.requestImage = (x: number, y: number, level: number, request?: Request) => {
    const rings = getRings()
    if (!rings.length) return undefined

    if (boundsVersion !== maskVersion) {
      boundsCache = rings.map(ringBounds)
      boundsVersion = maskVersion
    }

    const tileRect = base.tilingScheme.tileXYToRectangle(x, y, level)
    const tileWidth = base.tileWidth
    const tileHeight = base.tileHeight
    const relevant = ringsForTile(tileRect, boundsCache)

    if (!relevant.length) {
      return Promise.resolve(getTransparentTile(tileWidth, tileHeight))
    }

    const cacheKey = `${maskVersion}:${level}:${x}:${y}`
    const cached = maskCache.get(cacheKey)
    if (cached) return Promise.resolve(cached)

    const result = baseRequestImage(x, y, level, request)
    if (!result) return result

    return Promise.resolve(result).then((image) => {
      if (!image) return image
      const masked = maskImage(image, tileRect, relevant)
      rememberMaskedTile(cacheKey, masked)
      return masked
    })
  }

  return provider
}
