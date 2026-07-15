import { describe, expect, it } from 'vitest'
import { CHALLENGES } from '../src/content/tiers'
import { solveStaged, tokenize } from './driver'

/**
 * The crown jewel: every authored `par` is PROVEN by a reference solution that
 * clears all of a challenge's stages in exactly `par` keystrokes, played through
 * the real reducer. If a par is wrong or a challenge is unsolvable, this fails.
 */
const SOLUTIONS: Record<string, string> = {
  // Tier 1 - Panes
  't1-prefix': 'C-b%',
  't1-split-v': 'C-b"',
  't1-navigate': 'C-bo',
  't1-zoom': 'C-bz',
  't1-kill': 'C-bx',
  't1-capstone': 'C-b%C-b"',
  // Boss 1
  'b1-workspace': 'C-b%C-b"C-boC-b"C-bz',
  // Boss (tier 2) - rename, jump-by-number + kill, new + rename
  'b2-windows': 'C-b,editor<CR>C-b1C-b&C-bcC-b,logs<CR>',
  // Tier 2 - Windows
  't2-new-window': 'C-bc',
  't2-rename': 'C-b,editor<CR>',
  't2-switch': 'C-bn',
  't2-jump': 'C-b2',
  't2-kill-window': 'C-b&',
  't2-capstone': 'C-bcC-b,logs<CR>',
  // Tier 3 - Sessions & Copy
  't3-detach': 'C-bd',
  't3-rename-session': 'C-b$work<CR>',
  't3-new-session': 'C-b:new -s api<CR>',
  't3-copy-mode': 'C-b[',
  't3-copy-yank': 'C-b[<Space>$y',
  't3-capstone': 'C-b[/ERROR<CR><Space>$y',
  // Boss 2
  'b2-session-rescue': 'C-b$rescue<CR>C-b[/ERROR<CR><Space>$y',
  // Tier 4 - Rearrange (layouts)
  't4-cycle': 'C-b<Space>',
  't4-swap': 'C-b}',
  't4-break': 'C-b!',
  't4-swap-cycle': 'C-b}C-b<Space>',
  't4-capstone': 'C-b}C-boC-b!',
  // Boss 3
  'b3-rebuild': 'C-b%C-b"C-boC-b"C-b<Space>C-b!',
  // Tier 5 - Command line
  't5-cmd-open': 'C-b:splitw -v<CR>',
  't5-cmd-newwin': 'C-b:neww -n deploy<CR>',
  't5-cmd-jump': 'C-b:selectw -t 2<CR>',
  't5-cmd-swap': 'C-b:swapw -t 0<CR>',
  't5-cmd-newsession': 'C-b:new -s staging<CR>',
  't5-capstone': 'C-b:neww -n api<CR>C-b:splitw -h<CR>',
  // Boss 4
  'b4-pipeline': 'C-b:neww -n build<CR>C-b:splitw -h<CR>',
}

describe('every challenge is solvable at par', () => {
  for (const ch of CHALLENGES) {
    it(`${ch.id} - ${ch.title}`, () => {
      const sol = SOLUTIONS[ch.id]
      expect(sol, `no reference solution for ${ch.id}`).toBeTruthy()
      const keys = tokenize(sol)
      // The reference solves in exactly par keystrokes (par = the 3-star target).
      expect(keys.length, `${ch.id}: solution length must equal par`).toBe(ch.par)
      const run = solveStaged(ch, keys)
      expect(run.cleared, `${ch.id}: did not clear all stages`).toBe(run.total)
      expect(run.used, `${ch.id}: cleared using more keys than par`).toBeLessThanOrEqual(ch.par)
    })
  }
})

describe('boss budgets are sane', () => {
  for (const ch of CHALLENGES.filter((c) => c.kind === 'boss')) {
    it(`${ch.id} budget ≥ par`, () => {
      expect(ch.keystrokeBudget).toBeDefined()
      expect(ch.keystrokeBudget!).toBeGreaterThanOrEqual(ch.par)
    })
  }
})
