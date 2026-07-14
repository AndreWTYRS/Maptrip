import { ZOOM_LEVEL_BY_ID } from '../config/zoomLevels'
import { resolveMapColorScheme } from '../config/mapColors'
import { useGlobeStore } from '../store/globeStore'
import { useRevealStore } from '../store/revealStore'
import { getMapProvider } from '../providers/registry'
import { AuthPanel } from './AuthPanel'

function formatAltitude(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} км`
  return `${Math.round(meters)} м`
}

export function MapHud() {
  const providerId = useGlobeStore((s) => s.providerId)
  const countryCode = useGlobeStore((s) => s.countryCode)
  const altitudeMeters = useGlobeStore((s) => s.altitudeMeters)
  const zoomLevel = useGlobeStore((s) => s.zoomLevel)
  const isInputRevealed = useRevealStore((s) => s.isRevealed)
  const resetReveal = useRevealStore((s) => s.reset)

  const providerName = getMapProvider(providerId).name
  const zoomLabel = ZOOM_LEVEL_BY_ID[zoomLevel].label
  const colorScheme = resolveMapColorScheme(zoomLevel, isInputRevealed)
  const isColored = colorScheme === 'color'

  return (
    <header className="map-hud">
      <div className="map-hud__brand">Maptrip</div>
      <div className="map-hud__stats">
        <span>{providerName}</span>
        {countryCode && <span>{countryCode}</span>}
        <span>{zoomLabel}</span>
        <span>{formatAltitude(altitudeMeters)}</span>
        <span className={isColored ? 'map-hud__status map-hud__status--on' : 'map-hud__status'}>
          {isColored ? 'цветная' : 'серая'}
        </span>
      </div>
      <AuthPanel />
      <button type="button" className="map-hud__reset" onClick={resetReveal}>
        Сбросить цвет
      </button>
    </header>
  )
}
