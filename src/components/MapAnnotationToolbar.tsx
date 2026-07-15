import { useAuthStore } from '../store/authStore'
import { useAnnotationsStore } from '../store/annotationsStore'

export function MapAnnotationToolbar() {
  const user = useAuthStore((s) => s.user)
  const annotationMode = useAnnotationsStore((s) => s.annotationMode)
  const routeDraft = useAnnotationsStore((s) => s.routeDraft)
  const points = useAnnotationsStore((s) => s.points)
  const routes = useAnnotationsStore((s) => s.routes)
  const setAnnotationMode = useAnnotationsStore((s) => s.setAnnotationMode)
  const finishRoute = useAnnotationsStore((s) => s.finishRoute)
  const cancelRouteDraft = useAnnotationsStore((s) => s.cancelRouteDraft)

  if (!user) return null

  const userPoints = points.filter((p) => p.userId === user.id).length
  const userRoutes = routes.filter((r) => r.userId === user.id).length
  const draftCount = routeDraft?.length ?? 0

  return (
    <div className="annotation-toolbar" role="toolbar" aria-label="Map annotations">
      <span className="annotation-toolbar__hint">
        {annotationMode === 'point' && 'Click the map to add a point'}
        {annotationMode === 'route' &&
          (draftCount === 0
            ? 'Click to add route waypoints'
            : `${draftCount} waypoint${draftCount === 1 ? '' : 's'} — add more or finish`)}
        {annotationMode === 'none' && 'Add points or routes to reveal district color'}
      </span>

      <div className="annotation-toolbar__actions">
        <button
          type="button"
          className={
            annotationMode === 'point'
              ? 'annotation-toolbar__btn annotation-toolbar__btn--active'
              : 'annotation-toolbar__btn'
          }
          onClick={() =>
            setAnnotationMode(annotationMode === 'point' ? 'none' : 'point')
          }
        >
          Add point
        </button>

        <button
          type="button"
          className={
            annotationMode === 'route'
              ? 'annotation-toolbar__btn annotation-toolbar__btn--active'
              : 'annotation-toolbar__btn'
          }
          onClick={() =>
            setAnnotationMode(annotationMode === 'route' ? 'none' : 'route')
          }
        >
          Add route
        </button>

        {annotationMode === 'route' && draftCount >= 2 && (
          <button
            type="button"
            className="annotation-toolbar__btn annotation-toolbar__btn--primary"
            onClick={() => void finishRoute(user.id)}
          >
            Finish route
          </button>
        )}

        {annotationMode === 'route' && draftCount > 0 && (
          <button
            type="button"
            className="annotation-toolbar__btn"
            onClick={cancelRouteDraft}
          >
            Cancel
          </button>
        )}
      </div>

      {(userPoints > 0 || userRoutes > 0) && (
        <span className="annotation-toolbar__stats">
          {userPoints} point{userPoints === 1 ? '' : 's'} · {userRoutes} route
          {userRoutes === 1 ? '' : 's'}
        </span>
      )}
    </div>
  )
}
