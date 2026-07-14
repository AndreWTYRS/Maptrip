import { create } from 'zustand'
import { REVEAL_CONFIG, type RevealActionId } from '../config/revealActions'

interface RevealState {
  completedActions: Set<RevealActionId>
  isRevealed: boolean
  recordAction: (action: RevealActionId) => void
  reset: () => void
}

function evaluateReveal(completed: Set<RevealActionId>): boolean {
  const { requiredActions, mode } = REVEAL_CONFIG
  if (requiredActions.length === 0) return false

  if (mode === 'any') {
    return requiredActions.some((action) => completed.has(action))
  }

  return requiredActions.every((action) => completed.has(action))
}

export const useRevealStore = create<RevealState>((set, get) => ({
  completedActions: new Set(),
  isRevealed: false,

  recordAction: (action) => {
    const completed = new Set(get().completedActions)
    completed.add(action)
    set({
      completedActions: completed,
      isRevealed: evaluateReveal(completed),
    })
  },

  reset: () =>
    set({
      completedActions: new Set(),
      isRevealed: false,
    }),
}))
