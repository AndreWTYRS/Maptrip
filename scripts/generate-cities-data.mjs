/**
 * Generates per-country city lists from GeoNames cities5000 (CC BY 4.0).
 * Source: https://download.geonames.org/export/dump/cities5000.zip
 *
 * Usage: node scripts/generate-cities-data.mjs [path-to-cities5000.txt]
 */
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const inputPath = process.argv[2] ?? path.join(root, 'data-source', 'cities5000.txt')
const outputDir = path.join(root, 'public', 'data', 'cities')

if (!fs.existsSync(inputPath)) {
  console.error(`Missing ${inputPath}. Download GeoNames cities5000.txt first.`)
  process.exit(1)
}

const byCountry = new Map()

const rl = readline.createInterface({
  input: fs.createReadStream(inputPath),
  crlfDelay: Infinity,
})

for await (const line of rl) {
  const parts = line.split('\t')
  if (parts.length < 15) continue

  const geonameid = parts[0]
  const name = parts[2] || parts[1]
  const lat = Number(parts[4])
  const lon = Number(parts[5])
  const countryCode = parts[8]

  if (!countryCode || Number.isNaN(lat) || Number.isNaN(lon)) continue

  if (!byCountry.has(countryCode)) byCountry.set(countryCode, [])
  byCountry.get(countryCode).push({
    id: `${countryCode.toLowerCase()}-${geonameid}`,
    label: name,
    lat,
    lon,
    type: 'city',
  })
}

fs.mkdirSync(outputDir, { recursive: true })

const index = []
let totalCities = 0

for (const [code, cities] of [...byCountry.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  cities.sort((a, b) => a.label.localeCompare(b.label))
  fs.writeFileSync(path.join(outputDir, `${code}.json`), JSON.stringify(cities))
  index.push({ code, count: cities.length })
  totalCities += cities.length
}

fs.writeFileSync(path.join(outputDir, 'index.json'), JSON.stringify(index, null, 2))

fs.writeFileSync(
  path.join(outputDir, 'ATTRIBUTION.txt'),
  [
    'City data from GeoNames (https://www.geonames.org/)',
    'Dataset: cities5000.zip — cities with population > 5000 or capitals',
    'License: Creative Commons Attribution 4.0 (https://creativecommons.org/licenses/by/4.0/)',
  ].join('\n'),
)

console.log(`Wrote ${index.length} country files (${totalCities} cities) to ${outputDir}`)
