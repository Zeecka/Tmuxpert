import { describe, expect, it } from 'vitest'
import { CHALLENGES, WORLDS, standardForTier, tierUnlocked } from '../src/content/tiers'
import { BINDING_BY_ID } from '../src/tmux/catalog'
import { checkGoal } from '../src/game/runtime'
import { stagesOf } from '../src/game/types'
import { activeSession, activeWindow } from '../src/tmux/model'

describe('content integrity', () => {
  it('challenge ids are unique', () => {
    const ids = CHALLENGES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every taughtCommands id resolves in the catalog', () => {
    for (const ch of CHALLENGES) {
      for (const id of ch.taughtCommands) {
        expect(BINDING_BY_ID[id], `${ch.id} teaches unknown binding '${id}'`).toBeDefined()
      }
    }
  })

  it('pars are positive integers', () => {
    for (const ch of CHALLENGES) {
      expect(Number.isInteger(ch.par) && ch.par > 0, `${ch.id} has a bad par`).toBe(true)
    }
  })

  it('bosses have stages and a budget', () => {
    for (const ch of CHALLENGES.filter((c) => c.kind === 'boss')) {
      expect(ch.stages?.length, `${ch.id} boss has no stages`).toBeGreaterThan(0)
      expect(ch.keystrokeBudget, `${ch.id} boss has no budget`).toBeDefined()
    }
  })

  it('every start state is structurally valid', () => {
    for (const ch of CHALLENGES) {
      const sess = activeSession(ch.start)
      expect(sess, `${ch.id} has no active session`).toBeTruthy()
      expect(sess.windows.length, `${ch.id} session has no windows`).toBeGreaterThan(0)
      const w = activeWindow(ch.start)
      expect(w, `${ch.id} has no active window`).toBeTruthy()
    }
  })

  it('no challenge is already won at the start', () => {
    for (const ch of CHALLENGES) {
      const firstStage = stagesOf(ch)[0]
      expect(checkGoal(ch.start, firstStage.goal), `${ch.id} is already solved before any input`).toBe(false)
    }
  })
})

describe('world/tier wiring', () => {
  it('every challenge tier has a WORLDS entry', () => {
    const worldTiers = new Set(WORLDS.map((w) => w.tier))
    for (const ch of CHALLENGES) {
      expect(worldTiers.has(ch.tier), `tier ${ch.tier} (from ${ch.id}) has no WORLDS entry`).toBe(true)
    }
  })

  it('tier 1 is unlocked from a clean save; tier 2 is not', () => {
    expect(tierUnlocked(1, {})).toBe(true)
    expect(tierUnlocked(2, {})).toBe(false)
  })

  it('clearing tier 1 standard levels unlocks tier 2', () => {
    const completed = Object.fromEntries(
      standardForTier(1).map((c) => [c.id, { keystrokes: c.par, par: c.par, stars: 3 as const, xp: 0 }]),
    )
    expect(tierUnlocked(2, completed)).toBe(true)
  })
})
