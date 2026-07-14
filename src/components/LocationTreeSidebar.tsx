import { useMemo, useState } from 'react'
import {
  LOCATION_TREE,
  LOCATION_ZOOM,
  type LocationTreeNode,
} from '../config/locationTree'
import { useGlobeStore } from '../store/globeStore'
import { useAnnotationsStore } from '../store/annotationsStore'
import { districtKey } from '../utils/districtKey'

interface SearchEntry {
  node: LocationTreeNode
  path: string
  country: LocationTreeNode | null
  city: LocationTreeNode | null
}

function collectSearchEntries(
  nodes: LocationTreeNode[],
  country: LocationTreeNode | null = null,
  city: LocationTreeNode | null = null,
  pathParts: string[] = [],
): SearchEntry[] {
  const entries: SearchEntry[] = []

  for (const node of nodes) {
    const nextPath = [...pathParts, node.label]

    entries.push({
      node,
      path: nextPath.join(' · '),
      country: node.type === 'country' ? node : country,
      city: node.type === 'city' ? node : city,
    })

    if (node.children?.length) {
      entries.push(
        ...collectSearchEntries(
          node.children,
          node.type === 'country' ? node : country,
          node.type === 'city' ? node : city,
          nextPath,
        ),
      )
    }
  }

  return entries
}

const SEARCH_ENTRIES = collectSearchEntries(LOCATION_TREE)

interface ListItemProps {
  node: LocationTreeNode
  selectedId: string | null
  revealedDistricts: Set<string>
  subtitle?: string
  onSelect: (node: LocationTreeNode) => void
}

function ListItem({ node, selectedId, revealedDistricts, subtitle, onSelect }: ListItemProps) {
  const isRevealed =
    node.type === 'district' && revealedDistricts.has(districtKey(node.lat, node.lon))

  return (
    <li className="location-tree__item">
      <button
        type="button"
        className={
          selectedId === node.id
            ? 'location-tree__label location-tree__label--selected'
            : 'location-tree__label'
        }
        onClick={() => onSelect(node)}
      >
        <span className={`location-tree__type location-tree__type--${node.type}`}>
          {node.type}
        </span>
        <span className="location-tree__label-text">
          <span className="location-tree__label-name">{node.label}</span>
          {subtitle && <span className="location-tree__label-path">{subtitle}</span>}
        </span>
        {isRevealed && <span className="location-tree__revealed" title="Has points" />}
      </button>
    </li>
  )
}

export function LocationTreeSidebar() {
  const requestFlyToLocation = useGlobeStore((s) => s.requestFlyToLocation)
  const selectedLocationId = useGlobeStore((s) => s.selectedLocationId)
  const setSelectedLocationId = useGlobeStore((s) => s.setSelectedLocationId)
  const points = useAnnotationsStore((s) => s.points)
  const revealedDistricts = new Set(points.map((p) => p.districtKey))

  const [selectedCountry, setSelectedCountry] = useState<LocationTreeNode | null>(null)
  const [selectedCity, setSelectedCity] = useState<LocationTreeNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const isSearching = normalizedQuery.length > 0

  const searchResults = useMemo(() => {
    if (!isSearching) return []
    return SEARCH_ENTRIES.filter(
      (entry) =>
        entry.node.label.toLowerCase().includes(normalizedQuery) ||
        entry.path.toLowerCase().includes(normalizedQuery),
    )
  }, [isSearching, normalizedQuery])

  const visibleItems = useMemo(() => {
    if (isSearching) return null
    if (selectedCity) return selectedCity.children ?? []
    if (selectedCountry) return selectedCountry.children ?? []
    return LOCATION_TREE
  }, [isSearching, selectedCity, selectedCountry])

  const sectionTitle = isSearching
    ? 'Search results'
    : selectedCity
      ? 'Districts'
      : selectedCountry
        ? 'Cities'
        : 'Countries'

  function handleSelect(node: LocationTreeNode) {
    setSelectedLocationId(node.id)
    requestFlyToLocation(node.lat, node.lon, LOCATION_ZOOM[node.type])

    if (isSearching) {
      const entry = SEARCH_ENTRIES.find((item) => item.node.id === node.id)
      if (entry?.country) setSelectedCountry(entry.country)
      if (entry?.city) setSelectedCity(entry.city)
      else if (node.type === 'country') {
        setSelectedCountry(node)
        setSelectedCity(null)
      } else if (node.type === 'city') {
        setSelectedCity(node)
      }
      setSearchQuery('')
      return
    }

    if (node.type === 'country') {
      setSelectedCountry(node)
      setSelectedCity(null)
    } else if (node.type === 'city') {
      setSelectedCity(node)
    }
  }

  function handleBack() {
    if (selectedCity) {
      setSelectedCity(null)
      return
    }
    if (selectedCountry) {
      setSelectedCountry(null)
    }
  }

  const showBack = !isSearching && (selectedCountry !== null || selectedCity !== null)

  return (
    <aside className="location-tree" aria-label="Countries, cities, and districts">
      <h2 className="location-tree__title">Locations</h2>
      <div className="location-tree__search-wrap">
        <input
          type="search"
          className="location-tree__search"
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          aria-label="Search locations"
        />
      </div>
      <div className="location-tree__section">
        {showBack && (
          <button type="button" className="location-tree__back" onClick={handleBack}>
            ← Back
          </button>
        )}
        <h3 className="location-tree__section-title">{sectionTitle}</h3>
      </div>
      <ul className="location-tree__list location-tree__list--root">
        {isSearching &&
          (searchResults.length > 0 ? (
            searchResults.map((entry) => (
              <ListItem
                key={entry.node.id}
                node={entry.node}
                selectedId={selectedLocationId}
                revealedDistricts={revealedDistricts}
                subtitle={entry.path}
                onSelect={handleSelect}
              />
            ))
          ) : (
            <li className="location-tree__empty">No locations found</li>
          ))}
        {!isSearching &&
          visibleItems?.map((node) => (
            <ListItem
              key={node.id}
              node={node}
              selectedId={selectedLocationId}
              revealedDistricts={revealedDistricts}
              onSelect={handleSelect}
            />
          ))}
      </ul>
    </aside>
  )
}
