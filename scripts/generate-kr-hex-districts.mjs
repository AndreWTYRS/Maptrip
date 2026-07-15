/**
 * Generates H3 hex districts for South Korean cities from official KOSTAT 2018
 * sigungu (municipality) boundaries (southkorea/southkorea-maps, CC BY 4.0).
 *
 * Usage: node scripts/generate-kr-hex-districts.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { feature } from 'topojson-client'
import { cellToLatLng, polygonToCells } from 'h3-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const H3_RES = 7

const TOPO_PATH = path.join(root, 'data-source', 'kr-municipalities-2018-topo-simple.json')
const CITIES_PATH = path.join(root, 'public', 'data', 'cities', 'KR.json')
const OUTPUT_DIR = path.join(root, 'public', 'data', 'districts', 'KR')

/** KOSTAT 2018 sigungu code prefixes for metropolitan cities. */
const METRO_BY_CITY_ID = {
  'kr-1835848': '11', // Seoul
  'kr-1838524': '21', // Busan
  'kr-1835329': '22', // Daegu
  'kr-1843564': '23', // Incheon
  'kr-1841811': '24', // Gwangju (metropolitan)
  'kr-1835235': '25', // Daejeon
  'kr-1833747': '26', // Ulsan
  'kr-11523293': '29', // Sejong
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
    geometry.type === 'Polygon'
      ? geometry.coordinates[0]
      : geometry.coordinates[0][0]
  let lonSum = 0
  let latSum = 0
  for (const [lon, lat] of coords) {
    lonSum += lon
    latSum += lat
  }
  return { lon: lonSum / coords.length, lat: latSum / coords.length }
}

function hexCellsForPolygonRings(rings) {
  const cells = new Set()
  const [outer, ...holes] = rings
  if (outer.length < 4) return cells

  const loop = [
    outer.map(([lon, lat]) => [lat, lon]),
    ...holes.map((hole) => hole.map(([lon, lat]) => [lat, lon])),
  ]

  try {
    for (const cell of polygonToCells(loop, H3_RES)) cells.add(cell)
  } catch {
    // Skip tiny island polygons that H3 cannot tessellate at this resolution.
  }
  return cells
}

function hexCellsForFeature(geometry) {
  const cells = new Set()
  const polygonParts = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates

  for (const rings of polygonParts) {
    for (const cell of hexCellsForPolygonRings(rings)) cells.add(cell)
  }
  return cells
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

function districtNodesForCity(city, sigunguFeatures) {
  const districts = []
  const seen = new Set()

  for (const sigungu of sigunguFeatures) {
    const guName = sigungu.properties.name
    const guCode = String(sigungu.properties.code)

    for (const hexId of hexCellsForFeature(sigungu.geometry)) {
      if (seen.has(hexId)) continue
      seen.add(hexId)

      const [lat, lon] = cellToLatLng(hexId)
      // Compact tuple: [hexId, lat, lon, guCode, guName]
      districts.push([hexId, lat, lon, guCode, guName])
    }
  }

  districts.sort((a, b) => a[4].localeCompare(b[4], 'ko') || a[0].localeCompare(b[0]))
  return districts
}

if (!fs.existsSync(TOPO_PATH)) {
  console.error(`Missing ${TOPO_PATH}. Download KOSTAT municipalities topo first.`)
  process.exit(1)
}

const topo = JSON.parse(fs.readFileSync(TOPO_PATH, 'utf8'))
const objName = Object.keys(topo.objects)[0]
const collection = feature(topo, topo.objects[objName])
const sigunguFeatures = collection.features

const cities = JSON.parse(fs.readFileSync(CITIES_PATH, 'utf8'))
fs.mkdirSync(OUTPUT_DIR, { recursive: true })

const index = []
let totalDistricts = 0

for (const city of cities) {
  const matched = sigunguForCity(city, sigunguFeatures)
  const districts = districtNodesForCity(city, matched)

  if (!districts.length) {
    console.warn(`No districts for ${city.label} (${city.id})`)
    continue
  }

  const payload = {
    cityId: city.id,
    cityLabel: city.label,
    h3Resolution: H3_RES,
    source: 'KOSTAT 2018 municipalities (southkorea/southkorea-maps)',
    districts,
  }

  const fileName = `${city.id}.json`
  fs.writeFileSync(path.join(OUTPUT_DIR, fileName), JSON.stringify(payload))
  index.push({ cityId: city.id, cityLabel: city.label, count: districts.length, file: fileName })
  totalDistricts += districts.length
}

index.sort((a, b) => a.cityLabel.localeCompare(b.cityLabel))

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'index.json'),
  JSON.stringify(
    {
      countryCode: 'KR',
      h3Resolution: H3_RES,
      source: 'KOSTAT 2018 municipalities (southkorea/southkorea-maps)',
      cities: index,
      totalDistricts,
    },
    null,
    2,
  ),
)

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'ATTRIBUTION.txt'),
  `South Korea hex districts are derived from KOSTAT 2018 administrative boundaries.
Source: https://github.com/southkorea/southkorea-maps (CC BY 4.0)
Hex grid: Uber H3 resolution ${H3_RES}
`,
)

console.log(`Generated ${index.length} city files, ${totalDistricts} hex districts in ${OUTPUT_DIR}`)
