import { useEffect, useState, type ReactNode } from 'react'
import { loadKrGuLookup } from '../config/districtsByCity/krGuLookup'
import { useAnnotationsStore } from '../store/annotationsStore'
import { useGlobeStore } from '../store/globeStore'
import { isInSouthKorea } from '../utils/districtKey'

interface GlobeStageProps {
  children: ReactNode
}

export function GlobeStage({ children }: GlobeStageProps) {
  const countryCode = useGlobeStore((s) => s.countryCode)
  const centerLat = useGlobeStore((s) => s.centerLat)
  const centerLon = useGlobeStore((s) => s.centerLon)
  const points = useAnnotationsStore((s) => s.points) ?? []
  const [, setKrLookupReady] = useState(0)

  useEffect(() => {
    const needsKr =
      countryCode === 'KR' ||
      isInSouthKorea(centerLat, centerLon) ||
      points.some((point) => isInSouthKorea(point.lat, point.lon))
    if (!needsKr) return

    void loadKrGuLookup().then(() => setKrLookupReady((version) => version + 1))
  }, [countryCode, centerLat, centerLon, points])

  return <main className="globe-stage globe-stage--color">{children}</main>
}
