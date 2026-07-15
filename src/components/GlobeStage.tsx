import { useEffect, useState, type ReactNode } from 'react'
import { loadKrGuLookup } from '../config/districtsByCity/krGuLookup'
import { useGlobeStore } from '../store/globeStore'
import { useRevealStore } from '../store/revealStore'
import { useAnnotationsStore } from '../store/annotationsStore'
import { resolveMapColorScheme } from '../config/mapColors'
import { isInSouthKorea } from '../utils/districtKey'

interface GlobeStageProps {
  children: ReactNode
}

export function GlobeStage({ children }: GlobeStageProps) {
  const zoomLevel = useGlobeStore((s) => s.zoomLevel)
  const centerLat = useGlobeStore((s) => s.centerLat)
  const centerLon = useGlobeStore((s) => s.centerLon)
  const countryCode = useGlobeStore((s) => s.countryCode)
  const isInputRevealed = useRevealStore((s) => s.isRevealed)
  const points = useAnnotationsStore((s) => s.points) ?? []
  const revealedDistricts = new Set(points.map((p) => p.districtKey))
  const [, setKrLookupReady] = useState(0)

  useEffect(() => {
    const needsKr =
      countryCode === 'KR' ||
      isInSouthKorea(centerLat, centerLon) ||
      points.some((point) => isInSouthKorea(point.lat, point.lon))
    if (!needsKr) return

    void loadKrGuLookup().then(() => setKrLookupReady((version) => version + 1))
  }, [countryCode, centerLat, centerLon, points])

  const scheme = resolveMapColorScheme(
    zoomLevel,
    isInputRevealed,
    centerLat,
    centerLon,
    revealedDistricts,
  )

  return <main className={`globe-stage globe-stage--${scheme}`}>{children}</main>
}
