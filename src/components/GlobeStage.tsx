import type { ReactNode } from 'react'
import { useGlobeStore } from '../store/globeStore'
import { useRevealStore } from '../store/revealStore'
import { resolveMapColorScheme } from '../config/mapColors'

interface GlobeStageProps {
  children: ReactNode
}

export function GlobeStage({ children }: GlobeStageProps) {
  const zoomLevel = useGlobeStore((s) => s.zoomLevel)
  const isInputRevealed = useRevealStore((s) => s.isRevealed)
  const scheme = resolveMapColorScheme(zoomLevel, isInputRevealed)

  return <main className={`globe-stage globe-stage--${scheme}`}>{children}</main>
}
