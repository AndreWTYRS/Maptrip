import {
  ImageryProvider,
  Math as CesiumMath,
  Rectangle,
  WebMercatorProjection,
  type ImageryTypes,
  type Request,
} from 'cesium'
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

function getTransparentTile(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

/** Map tile pixel to lat/lon using Web Mercator (EPSG:3857) — linear lat breaks mask edges. */
function pixelToLatLon(
  px: number,
  py: number,
  width: number,
  height: number,
  tileRect: Rectangle,
): { lat: number; lon: number } {
  const lon = CesiumMath.toDegrees(
    CesiumMath.lerp(tileRect.west, tileRect.east, (px + 0.5) / width),
  )

  const southAngle = WebMercatorProjection.geodeticLatitudeToMercatorAngle(tileRect.south)
  const northAngle = WebMercatorProjection.geodeticLatitudeToMercatorAngle(tileRect.north)
  const mercatorAngle = CesiumMath.lerp(southAngle, northAngle, (py + 0.5) / height)
  const lat = CesiumMath.toDegrees(
    WebMercatorProjection.mercatorAngleToGeodeticLatitude(mercatorAngle),
  )

  return { lat, lon }
}

function drawTileToCanvas(image: ImageryTypes, width: number, height: number): {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D | null
} {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return { canvas, ctx: null }

  // Cesium fetches URL tiles with flipY; match that on returned canvases.
  ctx.translate(0, height)
  ctx.scale(1, -1)
  ctx.drawImage(image as CanvasImageSource, 0, 0, width, height)

  return { canvas, ctx }
}

function maskTile(
  image: ImageryTypes,
  tileRect: Rectangle,
  relevant: RingBounds[],
): HTMLCanvasElement {
  const { width, height } = getImageSize(image)
  const { canvas, ctx } = drawTileToCanvas(image, width, height)
  if (!ctx) return canvas

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const { lat, lon } = pixelToLatLon(px, py, width, height, tileRect)
      const inside = relevant.some(({ ring }) => pointInRing(lon, lat, ring))
      if (inside) continue

      data[(py * width + px) * 4 + 3] = 0
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
 * Color overlay: full-color tiles inside revealed polygons, transparent elsewhere.
 * Base layer stays native OSM with GPU desaturation so geography stays locked while panning.
 */
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

    if (boundsVersion !== tileCacheVersion) {
      boundsCache = rings.map(ringBounds)
      boundsVersion = tileCacheVersion
    }

    const tileRect = base.tilingScheme.tileXYToRectangle(x, y, level)
    const tileWidth = base.tileWidth
    const tileHeight = base.tileHeight
    const relevant = ringsForTile(tileRect, boundsCache)

    if (!relevant.length) {
      return Promise.resolve(getTransparentTile(tileWidth, tileHeight))
    }

    const cacheKey = `${tileCacheVersion}:${level}:${x}:${y}`
    const cached = tileCache.get(cacheKey)
    if (cached) return Promise.resolve(cached)

    const result = baseRequestImage(x, y, level, request)
    if (!result) return result

    return Promise.resolve(result).then((image) => {
      if (!image) return image
      const masked = maskTile(image, tileRect, relevant)
      rememberTile(cacheKey, masked)
      return masked
    })
  }

  return provider
}
