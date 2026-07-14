/**
 * User inputs that unlock full-color map below the world zoom level.
 * Update `requiredActions` when the input flow is defined.
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
  /** User inputs required before color fill appears on country/city/district */
  requiredActions: RevealActionId[]
  /** `any` — one input is enough; `all` — every input must fire */
  mode: 'any' | 'all'
}

/** Placeholder — add requiredActions when the input flow is defined */
export const REVEAL_CONFIG: RevealConfig = {
  requiredActions: [],
  mode: 'any',
}
