import { AFRICA_LOCATIONS } from './africa'
import { AMERICAS_LOCATIONS } from './americas'
import { ASIA_LOCATIONS } from './asia'
import { EUROPE_LOCATIONS } from './europe'
import { OCEANIA_LOCATIONS } from './oceania'

export type { LocationNodeType, LocationTreeNode } from './types'
export { LOCATION_ZOOM } from './types'

/** All sovereign states grouped by region, sorted alphabetically within each region. */
export const LOCATION_TREE = [
  ...AFRICA_LOCATIONS,
  ...AMERICAS_LOCATIONS,
  ...ASIA_LOCATIONS,
  ...EUROPE_LOCATIONS,
  ...OCEANIA_LOCATIONS,
].sort((a, b) => a.label.localeCompare(b.label))
