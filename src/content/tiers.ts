/**
 * World/tier assembly — the master challenge registry and unlock gating.
 * Mirrors Vimersion's tiers.ts: WORLDS metadata + a single CHALLENGES array in
 * play order + tierUnlocked().
 */
import type { Challenge, ChallengeResult, Tier, WorldMeta } from '../game/types'
import { bosses } from './bosses'
import { tier1 } from './tier1'
import { tier2 } from './tier2'
import { tier3 } from './tier3'
import { tier4 } from './tier4'
import { tier5 } from './tier5'

export const WORLDS: WorldMeta[] = [
  { tier: 1, name: 'Split', subtitle: 'Panes & the prefix', accent: 'var(--color-term)' },
  { tier: 2, name: 'Windows', subtitle: 'Your terminal tabs', accent: 'var(--color-cyan)' },
  { tier: 3, name: 'Sessions & Copy', subtitle: 'Detach, search, yank', accent: 'var(--color-magenta)' },
  { tier: 4, name: 'Rearrange', subtitle: 'Layouts, swap & break', accent: 'var(--color-amber)' },
  { tier: 5, name: 'Command Line', subtitle: 'The : prompt & scripting', accent: 'var(--color-cyan)' },
]

export function worldMeta(tier: Tier): WorldMeta {
  return WORLDS.find((w) => w.tier === tier) ?? WORLDS[0]
}

const boss = (tier: Tier): Challenge[] => bosses.filter((b) => b.tier === tier)

/** Play order: each tier's standard levels, then that tier's boss (if any). */
export const CHALLENGES: Challenge[] = [
  ...tier1,
  ...boss(1),
  ...tier2,
  ...boss(2),
  ...tier3,
  ...boss(3),
  ...tier4,
  ...boss(4),
  ...tier5,
  ...boss(5),
]

export const CHALLENGE_BY_ID: Record<string, Challenge> = Object.fromEntries(CHALLENGES.map((c) => [c.id, c]))

/** All challenges belonging to a world/tier, in order (standard then boss). */
export function challengesForTier(tier: Tier): Challenge[] {
  return CHALLENGES.filter((c) => c.tier === tier)
}

/** Standard (non-boss) challenges of a tier — these are the unlock gates. */
export function standardForTier(tier: Tier): Challenge[] {
  return challengesForTier(tier).filter((c) => c.kind !== 'boss')
}

/** A world unlocks once the PREVIOUS world's standard levels are all cleared.
 *  Bosses are deliberately NOT gates. Tier 1 is always open. */
export function tierUnlocked(tier: Tier, completed: Record<string, ChallengeResult>): boolean {
  if (tier <= 1) return true
  const prev = (tier - 1) as Tier
  return standardForTier(prev).every((c) => completed[c.id])
}

export const FIRST_CHALLENGE_ID = CHALLENGES[0].id

/** The next unsolved challenge in play order, or the last one if all done. */
export function nextChallengeId(completed: Record<string, ChallengeResult>): string {
  const next = CHALLENGES.find((c) => !completed[c.id])
  return (next ?? CHALLENGES[CHALLENGES.length - 1]).id
}

export function indexOfChallenge(id: string): number {
  return CHALLENGES.findIndex((c) => c.id === id)
}
