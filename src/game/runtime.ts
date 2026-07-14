/**
 * Goal evaluation — the single source of truth shared by the live play loop
 * (CampaignMode) and the headless par-proving tests. A goal is met when its
 * targetLayout matches (if given) AND its predicate is true (if given); at
 * least one must be specified.
 */
import { activeWindow, serializeLayout, type TmuxState } from '../tmux/model'
import type { Goal } from './types'

export function checkGoal(s: TmuxState, goal: Goal): boolean {
  if (goal.targetLayout === undefined && !goal.predicate) return false
  if (goal.targetLayout !== undefined && serializeLayout(activeWindow(s).layout) !== goal.targetLayout) return false
  if (goal.predicate && !goal.predicate(s)) return false
  return true
}
