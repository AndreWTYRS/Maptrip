import { ZOOM_LEVELS } from '../config/zoomLevels'
import { useGlobeStore } from '../store/globeStore'

export function ZoomLevelControls() {
  const zoomLevel = useGlobeStore((s) => s.zoomLevel)
  const requestFlyToLevel = useGlobeStore((s) => s.requestFlyToLevel)

  return (
    <div className="zoom-controls" role="toolbar" aria-label="Zoom level">
      {ZOOM_LEVELS.map((level) => (
        <button
          key={level.id}
          type="button"
          className={
            zoomLevel === level.id
              ? 'zoom-controls__btn zoom-controls__btn--active'
              : 'zoom-controls__btn'
          }
          aria-pressed={zoomLevel === level.id}
          onClick={() => requestFlyToLevel(level.id)}
        >
          {level.label}
        </button>
      ))}
    </div>
  )
}
