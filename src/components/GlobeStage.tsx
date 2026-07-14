import type { ReactNode } from 'react'
import { useGlobeStore } from '../store/globeStore'
import { useRevealStore } from '../store/revealStore'
import { useAnnotationsStore } from '../store/annotationsStore'
import { resolveMapColorScheme } from '../config/mapColors'

interface GlobeStageProps {
  children: ReactNode
}

export function GlobeStage({ children }: GlobeStageProps) {
  const zoomLevel = useGlobeStore((s) => s.zoomLevel)
  const centerLat = useGlobeStore((s) => s.centerLat)
  const centerLon = useGlobeStore((s) => s.centerLon)
  const isInputRevealed = useRevealStore((s) => s.isRevealed)
  const revealedDistrictKeys = useAnnotationsStore((s) => s.revealedDistrictKeys)
  const revealedDistricts = new Set(revealedDistrictKeys)
  const scheme = resolveMapColorScheme(
    zoomLevel,
    isInputRevealed,
    centerLat,
    centerLon,
    revealedDistricts,
  )

  return <main className={`globe-stage globe-stage--${scheme}`}>{children}</main>
}
