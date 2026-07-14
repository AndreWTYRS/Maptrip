/**
 * Actions that unlock the map (remove blur).
 * Update `requiredActions` when you define the final user flow.
 *
 * Built-in action ids emitted by the globe:
 * - globe_rotate   — user rotated the globe
 * - globe_zoom     — user zoomed in/out
 * - globe_tap      — user clicked/tapped the globe
 */
export type RevealActionId =
  | 'globe_rotate'
  | 'globe_zoom'
  | 'globe_tap'
  | (string & {})

export interface RevealConfig {
  /** Actions required before the map is revealed */
  requiredActions: RevealActionId[]
  /** `any` — one action is enough; `all` — every action must fire */
  mode: 'any' | 'all'
}

/** Placeholder config — replace requiredActions when the flow is defined */
export const REVEAL_CONFIG: RevealConfig = {
  requiredActions: ['globe_rotate'],
  mode: 'any',
}
