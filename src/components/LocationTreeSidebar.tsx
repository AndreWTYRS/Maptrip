import { useEffect, useMemo, useState } from 'react'
import { LOCATION_ZOOM, type LocationTreeNode } from '../config/locationTree'
import { useGlobeStore } from '../store/globeStore'
import { useAnnotationsStore } from '../store/annotationsStore'
import { useGoogleLocationStore } from '../store/googleLocationStore'
import { districtKey } from '../utils/districtKey'

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

  const countries = useGoogleLocationStore((s) => s.countries)
  const countriesLoading = useGoogleLocationStore((s) => s.countriesLoading)
  const countriesError = useGoogleLocationStore((s) => s.countriesError)
  const citiesByCountryId = useGoogleLocationStore((s) => s.citiesByCountryId)
  const citiesLoadingId = useGoogleLocationStore((s) => s.citiesLoadingId)
  const districtsByCityId = useGoogleLocationStore((s) => s.districtsByCityId)
  const districtsLoadingId = useGoogleLocationStore((s) => s.districtsLoadingId)
  const loadCountries = useGoogleLocationStore((s) => s.loadCountries)
  const loadCities = useGoogleLocationStore((s) => s.loadCities)
  const loadDistricts = useGoogleLocationStore((s) => s.loadDistricts)
  const searchLocations = useGoogleLocationStore((s) => s.searchLocations)

  const [selectedCountry, setSelectedCountry] = useState<LocationTreeNode | null>(null)
  const [selectedCity, setSelectedCity] = useState<LocationTreeNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<LocationTreeNode[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const isSearching = normalizedQuery.length > 0

  useEffect(() => {
    void loadCountries()
  }, [loadCountries])

  useEffect(() => {
    if (!isSearching) {
      setSearchResults([])
      return
    }

    const timer = window.setTimeout(async () => {
      setSearchLoading(true)
      const results = await searchLocations(searchQuery.trim())
      setSearchResults(results)
      setSearchLoading(false)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [isSearching, searchQuery, searchLocations])

  const visibleCities = selectedCountry ? (citiesByCountryId[selectedCountry.id] ?? []) : []
  const visibleDistricts = selectedCity ? (districtsByCityId[selectedCity.id] ?? []) : []

  const sectionTitle = isSearching
    ? 'Search results'
    : selectedCity
      ? 'Districts'
      : selectedCountry
        ? 'Cities'
        : 'Countries'

  async function handleSelectCountry(country: LocationTreeNode) {
    setSelectedCountry(country)
    setSelectedCity(null)
    setSelectedLocationId(country.id)
    requestFlyToLocation(country.lat, country.lon, LOCATION_ZOOM.country)
    await loadCities(country, country.countryCode)
  }

  async function handleSelectCity(city: LocationTreeNode) {
    if (!selectedCountry) return
    setSelectedCity(city)
    setSelectedLocationId(city.id)
    requestFlyToLocation(city.lat, city.lon, LOCATION_ZOOM.city)
    await loadDistricts(city, selectedCountry)
  }

  function handleSelectDistrict(node: LocationTreeNode) {
    setSelectedLocationId(node.id)
    requestFlyToLocation(node.lat, node.lon, LOCATION_ZOOM.district)
  }

  function handleSearchSelect(node: LocationTreeNode) {
    setSearchQuery('')
    setSelectedLocationId(node.id)
    requestFlyToLocation(node.lat, node.lon, LOCATION_ZOOM[node.type])

    if (node.type === 'country') {
      setSelectedCountry(node)
      setSelectedCity(null)
      void loadCities(node, node.countryCode)
      return
    }

    if (node.type === 'city') {
      setSelectedCity(node)
      if (selectedCountry) void loadDistricts(node, selectedCountry)
      return
    }

    handleSelectDistrict(node)
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
  const isLoading =
    countriesLoading ||
    (selectedCountry && citiesLoadingId === selectedCountry.id) ||
    (selectedCity && districtsLoadingId === selectedCity.id)

  const emptyMessage = useMemo(() => {
    if (countriesError) return countriesError
    if (isLoading) return 'Loading...'
    if (isSearching && searchLoading) return 'Searching Google Places...'
    if (isSearching && !searchLoading && searchResults.length === 0) return 'No locations found'
    if (selectedCity && visibleDistricts.length === 0) return 'No districts found for this city'
    if (selectedCountry && visibleCities.length === 0) return 'No cities found for this country'
    if (!selectedCountry && !isSearching && (countries?.length ?? 0) === 0) {
      return 'No countries loaded'
    }
    return null
  }, [
    countries?.length,
    countriesError,
    isLoading,
    isSearching,
    searchLoading,
    searchResults.length,
    selectedCity,
    selectedCountry,
    visibleCities.length,
    visibleDistricts.length,
  ])

  return (
    <aside className="location-tree" aria-label="Countries, cities, and districts">
      <h2 className="location-tree__title">Locations</h2>
      <div className="location-tree__search-wrap">
        <input
          type="search"
          className="location-tree__search"
          placeholder="Search Google locations..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          aria-label="Search Google locations"
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
        {emptyMessage && <li className="location-tree__empty">{emptyMessage}</li>}
        {isSearching &&
          searchResults.map((node) => (
            <ListItem
              key={node.id}
              node={node}
              selectedId={selectedLocationId}
              revealedDistricts={revealedDistricts}
              onSelect={handleSearchSelect}
            />
          ))}
        {!isSearching && !selectedCountry &&
          (countries ?? []).map((country) => (
            <ListItem
              key={country.id}
              node={country}
              selectedId={selectedLocationId}
              revealedDistricts={revealedDistricts}
              onSelect={(node) => void handleSelectCountry(node)}
            />
          ))}
        {!isSearching && selectedCountry && !selectedCity &&
          visibleCities.map((city) => (
            <ListItem
              key={city.id}
              node={city}
              selectedId={selectedLocationId}
              revealedDistricts={revealedDistricts}
              onSelect={(node) => void handleSelectCity(node)}
            />
          ))}
        {!isSearching && selectedCity &&
          visibleDistricts.map((district) => (
            <ListItem
              key={district.id}
              node={district}
              selectedId={selectedLocationId}
              revealedDistricts={revealedDistricts}
              onSelect={handleSelectDistrict}
            />
          ))}
      </ul>
    </aside>
  )
}
