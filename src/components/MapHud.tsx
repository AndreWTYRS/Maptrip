import { ZOOM_LEVEL_BY_ID } from '../config/zoomLevels'
import { resolveMapColorScheme } from '../config/mapColors'
import { useGlobeStore } from '../store/globeStore'
import { getMapProvider } from '../providers/registry'
import { countryNameEn } from '../utils/countryNameEn'
import { AuthPanel } from './AuthPanel'

function formatAltitude(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
  return `${Math.round(meters)} m`
}

export function MapHud() {
  const providerId = useGlobeStore((s) => s.providerId)
  const countryCode = useGlobeStore((s) => s.countryCode)
  const altitudeMeters = useGlobeStore((s) => s.altitudeMeters)
  const zoomLevel = useGlobeStore((s) => s.zoomLevel)
  const providerName = getMapProvider(providerId).name
  const countryName = countryNameEn(countryCode)
  const zoomLabel = ZOOM_LEVEL_BY_ID[zoomLevel].label
  const colorScheme = resolveMapColorScheme(zoomLevel)
  const isColored = colorScheme === 'color'

  return (
    <header className="map-hud">
      <div className="map-hud__brand">Maptrip</div>
      <div className="map-hud__stats">
        <span>{providerName}</span>
        {countryName && <span>{countryName}</span>}
        <span>{zoomLabel}</span>
        <span>{formatAltitude(altitudeMeters)}</span>
        <span className={isColored ? 'map-hud__status map-hud__status--on' : 'map-hud__status'}>
          {isColored ? 'color' : 'grayscale'}
        </span>
      </div>
      <AuthPanel />
    </header>
  )
}
