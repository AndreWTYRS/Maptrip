import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useAnnotationsStore } from '../store/annotationsStore'
import { useGlobeStore } from '../store/globeStore'
import { useGoogleLocationStore } from '../store/googleLocationStore'
import type { MapPoint } from '../types/annotations'
import type { ReverseGeocodeResult } from '../services/googleGeocoding'
import {
  collectPointSearchEntries,
  groupPointsByGeocoding,
  type PointCityGroup,
  type PointCountryGroup,
} from '../utils/groupPointsByLocation'

interface PointItemProps {
  point: MapPoint
  selectedId: string | null
  subtitle?: string
  onSelect: (point: MapPoint) => void
  onDelete: (point: MapPoint) => void
}

function PointItem({ point, selectedId, subtitle, onSelect, onDelete }: PointItemProps) {
  return (
    <li className="location-tree__item">
      <div className="marks-list__row">
        <button
          type="button"
          className={
            selectedId === point.id
              ? 'location-tree__label location-tree__label--selected'
              : 'location-tree__label'
          }
          onClick={() => onSelect(point)}
        >
          <span className="location-tree__type location-tree__type--district">point</span>
          <span className="location-tree__label-text">
            <span className="location-tree__label-name">{point.label}</span>
            {subtitle && <span className="location-tree__label-path">{subtitle}</span>}
          </span>
        </button>
        <button
          type="button"
          className="marks-list__delete"
          aria-label={`Delete ${point.label}`}
          onClick={() => onDelete(point)}
        >
          ×
        </button>
      </div>
    </li>
  )
}

interface GroupItemProps {
  id: string
  label: string
  type: 'country' | 'city'
  selectedId: string | null
  onSelect: () => void
}

function GroupItem({ id, label, type, selectedId, onSelect }: GroupItemProps) {
  return (
    <li className="location-tree__item">
      <button
        type="button"
        className={
          selectedId === id
            ? 'location-tree__label location-tree__label--selected'
            : 'location-tree__label'
        }
        onClick={onSelect}
      >
        <span className={`location-tree__type location-tree__type--${type}`}>{type}</span>
        <span className="location-tree__label-text">
          <span className="location-tree__label-name">{label}</span>
        </span>
      </button>
    </li>
  )
}

export function MarksListSidebar() {
  const user = useAuthStore((s) => s.user)
  const points = useAnnotationsStore((s) => s.points)
  const removePoint = useAnnotationsStore((s) => s.removePoint)
  const requestFlyToLocation = useGlobeStore((s) => s.requestFlyToLocation)
  const resolvePointLocation = useGoogleLocationStore((s) => s.resolvePointLocation)

  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null)
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null)
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [geocodedPoints, setGeocodedPoints] = useState<Map<string, ReverseGeocodeResult | null>>(
    new Map(),
  )

  const userPoints = useMemo(
    () => (user ? points.filter((point) => point.userId === user.id) : []),
    [points, user],
  )

  useEffect(() => {
    if (!user || userPoints.length === 0) {
      setGeocodedPoints(new Map())
      return
    }

    let cancelled = false

    async function geocodePoints() {
      const entries = await Promise.all(
        userPoints.map(async (point) => {
          const location = await resolvePointLocation(point.id, point.lat, point.lon)
          return [point.id, location] as const
        }),
      )

      if (!cancelled) {
        setGeocodedPoints(new Map(entries))
      }
    }

    void geocodePoints()

    return () => {
      cancelled = true
    }
  }, [resolvePointLocation, user, userPoints])

  const countryGroups = useMemo(
    () => groupPointsByGeocoding(userPoints, geocodedPoints),
    [geocodedPoints, userPoints],
  )
  const searchEntries = useMemo(() => collectPointSearchEntries(countryGroups), [countryGroups])

  const activeCountry = useMemo(
    () => countryGroups.find((group) => group.id === selectedCountryId) ?? null,
    [countryGroups, selectedCountryId],
  )

  const activeCity = useMemo(
    () => activeCountry?.cities.find((city) => city.id === selectedCityId) ?? null,
    [activeCountry, selectedCityId],
  )

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const isSearching = normalizedQuery.length > 0

  const searchResults = useMemo(() => {
    if (!isSearching) return []
    return searchEntries.filter(
      (entry) =>
        entry.point.label.toLowerCase().includes(normalizedQuery) ||
        entry.path.toLowerCase().includes(normalizedQuery),
    )
  }, [isSearching, normalizedQuery, searchEntries])

  const sectionTitle = isSearching
    ? 'Search results'
    : activeCity
      ? 'Points'
      : activeCountry
        ? 'Cities'
        : 'Countries'

  function handleSelectCountry(country: PointCountryGroup) {
    setSelectedCountryId(country.id)
    setSelectedCityId(null)
    setSelectedPointId(null)
    requestFlyToLocation(country.lat, country.lon, 'country')
  }

  function handleSelectCity(city: PointCityGroup) {
    setSelectedCityId(city.id)
    setSelectedPointId(null)
    requestFlyToLocation(city.lat, city.lon, 'city')
  }

  function handleSelectPoint(point: MapPoint) {
    setSelectedPointId(point.id)
    requestFlyToLocation(point.lat, point.lon, 'district')
  }

  function handleDeletePoint(point: MapPoint) {
    if (!user) return
    removePoint(user.id, point.id)
    if (selectedPointId === point.id) setSelectedPointId(null)
  }

  function handleSearchSelect(entry: (typeof searchEntries)[number]) {
    setSelectedCountryId(entry.countryId)
    setSelectedCityId(entry.cityId)
    handleSelectPoint(entry.point)
    setSearchQuery('')
  }

  function handleBack() {
    if (selectedCityId) {
      setSelectedCityId(null)
      setSelectedPointId(null)
      return
    }
    if (selectedCountryId) {
      setSelectedCountryId(null)
      setSelectedPointId(null)
    }
  }

  const showBack = !isSearching && (selectedCountryId !== null || selectedCityId !== null)

  if (!user) {
    return (
      <aside className="location-tree location-tree--right" aria-label="Your map points">
        <h2 className="location-tree__title">Points</h2>
        <p className="location-tree__empty">Sign in to view and manage points</p>
      </aside>
    )
  }

  return (
    <aside className="location-tree location-tree--right" aria-label="Your map points">
      <h2 className="location-tree__title">Points</h2>
      <div className="location-tree__search-wrap">
        <input
          type="search"
          className="location-tree__search"
          placeholder="Search points..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          aria-label="Search points"
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
        {userPoints.length === 0 && !isSearching && (
          <li className="location-tree__empty">No points yet</li>
        )}
        {isSearching &&
          (searchResults.length > 0 ? (
            searchResults.map((entry) => (
              <PointItem
                key={entry.point.id}
                point={entry.point}
                selectedId={selectedPointId}
                subtitle={entry.path}
                onSelect={() => handleSearchSelect(entry)}
                onDelete={(point) => handleDeletePoint(point)}
              />
            ))
          ) : (
            <li className="location-tree__empty">No points found</li>
          ))}
        {!isSearching && !activeCountry &&
          countryGroups.map((country) => (
            <GroupItem
              key={country.id}
              id={country.id}
              label={country.label}
              type="country"
              selectedId={null}
              onSelect={() => handleSelectCountry(country)}
            />
          ))}
        {!isSearching && activeCountry && !activeCity &&
          activeCountry.cities.map((city) => (
            <GroupItem
              key={city.id}
              id={city.id}
              label={city.label}
              type="city"
              selectedId={null}
              onSelect={() => handleSelectCity(city)}
            />
          ))}
        {!isSearching && activeCity &&
          activeCity.points.map((point) => (
            <PointItem
              key={point.id}
              point={point}
              selectedId={selectedPointId}
              onSelect={handleSelectPoint}
              onDelete={handleDeletePoint}
            />
          ))}
        {!isSearching && activeCity && activeCity.points.length === 0 && (
          <li className="location-tree__empty">No points in this city</li>
        )}
      </ul>
    </aside>
  )
}
