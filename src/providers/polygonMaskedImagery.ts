import {
  ImageryProvider,
  Math as CesiumMath,
  Rectangle,
  type ImageryTypes,
  type Request,
} from 'cesium'
import { pointInGuRings, type LatLonRing } from '../config/districtsByCity/krGuLookup'

function ringBBox(ring: LatLonRing) {
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
  return { minLat, maxLat, minLon, maxLon }
}

function getImageSize(image: ImageryTypes): { width: number; height: number } {
  if (image instanceof HTMLCanvasElement) return { width: image.width, height: image.height }
  if (image instanceof HTMLImageElement) return { width: image.width, height: image.height }
  if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) {
    return { width: image.width, height: image.height }
  }
  return { width: 256, height: 256 }
}

function toCanvas(image: ImageryTypes, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.drawImage(image as CanvasImageSource, 0, 0, width, height)
  return canvas
}

function transparentTile(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

function maskImage(image: ImageryTypes, tileRect: Rectangle, rings: LatLonRing[]): HTMLCanvasElement {
  const { width, height } = getImageSize(image)
  const canvas = toCanvas(image, width, height)
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  const west = CesiumMath.toDegrees(tileRect.west)
  const south = CesiumMath.toDegrees(tileRect.south)
  const east = CesiumMath.toDegrees(tileRect.east)
  const north = CesiumMath.toDegrees(tileRect.north)
  const lonSpan = east - west
  const latSpan = north - south

  for (let py = 0; py < height; py++) {
    const lat = north - ((py + 0.5) / height) * latSpan
    for (let px = 0; px < width; px++) {
      const lon = west + ((px + 0.5) / width) * lonSpan
      const inside = rings.some((ring) => pointInGuRings(lon, lat, [ring]))
      if (!inside) {
        data[(py * width + px) * 4 + 3] = 0
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

function tileIntersectsRingBounds(tileRect: Rectangle, rings: LatLonRing[]): boolean {
  const west = CesiumMath.toDegrees(tileRect.west)
  const south = CesiumMath.toDegrees(tileRect.south)
  const east = CesiumMath.toDegrees(tileRect.east)
  const north = CesiumMath.toDegrees(tileRect.north)

  return rings.some((ring) => {
    const { minLat, maxLat, minLon, maxLon } = ringBBox(ring)
    return west <= maxLon && east >= minLon && south <= maxLat && north >= minLat
  })
}

export function createPolygonMaskedImageryProvider(
  base: ImageryProvider,
  getRings: () => LatLonRing[],
): ImageryProvider {
  const provider = Object.create(base) as ImageryProvider
  const baseRequestImage = base.requestImage.bind(base)

  Object.defineProperty(provider, 'hasAlphaChannel', {
    configurable: true,
    get: () => true,
  })

  provider.requestImage = (x: number, y: number, level: number, request?: Request) => {
    const rings = getRings()
    if (!rings.length) return undefined

    const tileRect = base.tilingScheme.tileXYToRectangle(x, y, level)
    const tileWidth = base.tileWidth
    const tileHeight = base.tileHeight

    if (!tileIntersectsRingBounds(tileRect, rings)) {
      return Promise.resolve(transparentTile(tileWidth, tileHeight))
    }

    const result = baseRequestImage(x, y, level, request)
    if (!result) return result

    return Promise.resolve(result).then((image) => {
      if (!image) return image
      return maskImage(image, tileRect, rings)
    })
  }

  return provider
}
