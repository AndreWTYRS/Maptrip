import { useRevealStore } from '../store/revealStore'
import { REVEAL_CONFIG } from '../config/revealActions'

export function BlurOverlay() {
  const isRevealed = useRevealStore((s) => s.isRevealed)
  const completedActions = useRevealStore((s) => s.completedActions)

  const pendingActions = REVEAL_CONFIG.requiredActions.filter(
    (action) => !completedActions.has(action),
  )

  return (
    <div
      className={`blur-overlay ${isRevealed ? 'blur-overlay--revealed' : ''}`}
      aria-hidden={isRevealed}
    >
      {!isRevealed && (
        <div className="blur-overlay__hint">
          <p className="blur-overlay__title">Карта скрыта</p>
          <p className="blur-overlay__subtitle">
            Покрутите или увеличьте глобус, чтобы раскрыть карту
          </p>
          {REVEAL_CONFIG.requiredActions.length > 0 && (
            <ul className="blur-overlay__actions">
              {REVEAL_CONFIG.requiredActions.map((action) => (
                <li
                  key={action}
                  className={
                    completedActions.has(action)
                      ? 'blur-overlay__action blur-overlay__action--done'
                      : 'blur-overlay__action'
                  }
                >
                  {actionLabel(action)}
                </li>
              ))}
            </ul>
          )}
          {pendingActions.length > 0 && REVEAL_CONFIG.mode === 'all' && (
            <p className="blur-overlay__mode">Нужны все действия</p>
          )}
        </div>
      )}
    </div>
  )
}

function actionLabel(action: string): string {
  const labels: Record<string, string> = {
    globe_rotate: 'Повернуть глобус',
    globe_zoom: 'Приблизить / отдалить',
    globe_tap: 'Нажать на карту',
  }
  return labels[action] ?? action
}
