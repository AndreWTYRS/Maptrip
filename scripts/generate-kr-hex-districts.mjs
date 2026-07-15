/**
 * Generates official KOSTAT 2018 sigungu (gu) district boundaries for South Korea.
 * Source: southkorea/southkorea-maps (CC BY 4.0)
 *
 * Usage: node scripts/generate-kr-hex-districts.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { feature } from 'topojson-client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const TOPO_PATH = path.join(root, 'data-source', 'kr-municipalities-2018-topo-simple.json')
const CITIES_PATH = path.join(root, 'public', 'data', 'cities', 'KR.json')
const OUTPUT_DIR = path.join(root, 'public', 'data', 'districts', 'KR')

const METRO_BY_CITY_ID = {
  'kr-1835848': '11',
  'kr-1838524': '21',
  'kr-1835329': '22',
  'kr-1843564': '23',
  'kr-1841811': '24',
  'kr-1835235': '25',
  'kr-1833747': '26',
  'kr-11523293': '29',
}

function pointInRing(lon, lat, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersect =
      yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi + 0.0) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function pointInFeature(lon, lat, geometry) {
  if (geometry.type === 'Polygon') {
    const [outer, ...holes] = geometry.coordinates
    if (!pointInRing(lon, lat, outer)) return false
    return !holes.some((hole) => pointInRing(lon, lat, hole))
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some(([outer, ...holes]) => {
      if (!pointInRing(lon, lat, outer)) return false
      return !holes.some((hole) => pointInRing(lon, lat, hole))
    })
  }
  return false
}

function featureCentroid(geometry) {
  const coords =
    geometry.type === 'Polygon' ? geometry.coordinates[0] : geometry.coordinates[0][0]
  let lonSum = 0
  let latSum = 0
  for (const [lon, lat] of coords) {
    lonSum += lon
    latSum += lat
  }
  return { lon: lonSum / coords.length, lat: latSum / coords.length }
}

function simplifyRing(lonLatRing, maxPoints = 72) {
  if (lonLatRing.length <= maxPoints) {
    return lonLatRing.map(([lon, lat]) => [lat, lon])
  }
  const step = Math.ceil(lonLatRing.length / maxPoints)
  return lonLatRing.filter((_, index) => index % step === 0).map(([lon, lat]) => [lat, lon])
}

function ringsFromGeometry(geometry) {
  const rings = []
  const parts = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  for (const part of parts) {
    if (part[0]?.length >= 4) rings.push(simplifyRing(part[0]))
  }
  return rings
}

function sigunguForCity(city, features) {
  const metroPrefix = METRO_BY_CITY_ID[city.id]
  if (metroPrefix) {
    return features.filter((f) => String(f.properties.code).startsWith(metroPrefix))
  }

  const containing = features.filter((f) => pointInFeature(city.lon, city.lat, f.geometry))
  if (containing.length) return containing

  let nearest = null
  let minDist = 0.25 ** 2
  for (const f of features) {
    const c = featureCentroid(f.geometry)
    const dist = (c.lat - city.lat) ** 2 + (c.lon - city.lon) ** 2
    if (dist < minDist) {
      minDist = dist
      nearest = f
    }
  }
  return nearest ? [nearest] : []
}

function districtFromSigungu(sigungu) {
  const guCode = String(sigungu.properties.code)
  const guName = sigungu.properties.name
  const guNameEn = sigungu.properties.name_eng || guName
  const centroid = featureCentroid(sigungu.geometry)
  const rings = ringsFromGeometry(sigungu.geometry)

  return {
    id: `kr-gu-${guCode}`,
    guCode,
    name: guName,
    nameEn: guNameEn,
    lat: centroid.lat,
    lon: centroid.lon,
    rings,
  }
}

if (!fs.existsSync(TOPO_PATH)) {
  console.error(`Missing ${TOPO_PATH}. Download KOSTAT municipalities topo first.`)
  process.exit(1)
}

const topo = JSON.parse(fs.readFileSync(TOPO_PATH, 'utf8'))
const objName = Object.keys(topo.objects)[0]
const collection = feature(topo, topo.objects[objName])
const sigunguFeatures = collection.features

const guLookup = sigunguFeatures.map(districtFromSigungu)
const guByCode = new Map(guLookup.map((gu) => [gu.guCode, gu]))

const cities = JSON.parse(fs.readFileSync(CITIES_PATH, 'utf8'))
fs.mkdirSync(OUTPUT_DIR, { recursive: true })

const index = []
let totalDistricts = 0

for (const city of cities) {
  const matched = sigunguForCity(city, sigunguFeatures)
  const districts = matched
    .map((sigungu) => districtFromSigungu(sigungu))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'))

  if (!districts.length) {
    console.warn(`No districts for ${city.label} (${city.id})`)
    continue
  }

  const payload = {
    cityId: city.id,
    cityLabel: city.label,
    source: 'KOSTAT 2018 municipalities (southkorea/southkorea-maps)',
    districts,
  }

  const fileName = `${city.id}.json`
  fs.writeFileSync(path.join(OUTPUT_DIR, fileName), JSON.stringify(payload))
  index.push({ cityId: city.id, cityLabel: city.label, count: districts.length, file: fileName })
  totalDistricts += districts.length
}

index.sort((a, b) => a.cityLabel.localeCompare(b.cityLabel))

fs.writeFileSync(path.join(OUTPUT_DIR, 'gu-lookup.json'), JSON.stringify(guLookup))
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'index.json'),
  JSON.stringify(
    {
      countryCode: 'KR',
      source: 'KOSTAT 2018 municipalities (southkorea/southkorea-maps)',
      cities: index,
      totalDistricts,
      guCount: guLookup.length,
    },
    null,
    2,
  ),
)

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'ATTRIBUTION.txt'),
  `South Korea district boundaries are from KOSTAT 2018 administrative sigungu (gu) polygons.
Source: https://github.com/southkorea/southkorea-maps (CC BY 4.0)
`,
)

console.log(
  `Generated ${index.length} city files, ${totalDistricts} district entries, ${guLookup.length} gu boundaries in ${OUTPUT_DIR}`,
)
