import type { TmuxState } from '../tmux/model'

export type Tier = 1 | 2 | 3 | 4 | 5 | 6

/** A win condition: an exact layout string, or a predicate over the whole
 *  multiplexer state. Analog of Vimersion's Goal (targetText | predicate). */
export interface Goal {
  /** Win when the active window's serialized layout equals this (see
   *  serializeLayout). The tmux analog of Vimersion's `targetText`. */
  targetLayout?: string
  /** Or win when this predicate is true. Checked after every keystroke. */
  predicate?: (s: TmuxState) => boolean
  /** Human-readable description of the win condition. */
  describe: string
}

/** One stage of a multi-stage (boss) challenge, fought in the SAME session. */
export interface ChallengeStage {
  /** Instruction shown when this stage begins (falls back to the challenge brief). */
  brief?: string
  goal: Goal
}

/** A single campaign challenge, authored as pure data (content-as-data). */
export interface Challenge {
  id: string
  tier: Tier
  title: string
  /** One-line instruction shown above the surface. */
  brief: string
  /** Binding ids (see catalog.ts) credited toward mastery on completion. */
  taughtCommands: string[]
  /** The starting multiplexer state (replaces Vimersion's startText/startCursor). */
  start: TmuxState
  goal: Goal
  /** Target keystroke count for a perfect (3-star) solve. */
  par: number
  hint: string
  /** 'boss' gets multi-stage flow, a keystroke budget & a special result screen. */
  kind?: 'standard' | 'boss'
  /** Boss stages 2..n, checked in order after `goal` (stage 1) — same session,
   *  no surface remount between stages. */
  stages?: ChallengeStage[]
  /** Boss "HP bar": exceeding this many keystrokes fails the attempt
   *  (free retry, no penalty). Guideline ≈ ceil(par · 2.2). */
  keystrokeBudget?: number
}

/** Normalized stage list — the ONLY way runtime code should read goals. */
export function stagesOf(ch: Challenge): ChallengeStage[] {
  return [{ brief: ch.brief, goal: ch.goal }, ...(ch.stages ?? [])]
}

export interface WorldMeta {
  tier: Tier
  name: string
  subtitle: string
  /** CSS color token used as the world accent. */
  accent: string
}

export type Stars = 1 | 2 | 3

export interface ChallengeResult {
  keystrokes: number
  par: number
  stars: Stars
  xp: number
}
